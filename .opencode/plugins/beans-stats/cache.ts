import type { Stats, StatusCount, TypeCount } from "./layout.ts"

export const CACHE_KEY = "beans.stats.cache"

export interface CacheState {
  [directory: string]: Stats
}

function decodeCount(entry: unknown): StatusCount | null {
  if (typeof entry !== "object" || entry === null) {
    return null
  }
  const record = entry as { status?: unknown; count?: unknown }
  if (typeof record.status !== "string" || typeof record.count !== "number") {
    return null
  }
  return { status: record.status, count: record.count }
}

function decodeType(entry: unknown): TypeCount | null {
  if (typeof entry !== "object" || entry === null) {
    return null
  }
  const record = entry as { type?: unknown; count?: unknown }
  if (typeof record.type !== "string" || typeof record.count !== "number") {
    return null
  }
  return { type: record.type, count: record.count }
}

export function decodeStats(raw: unknown): Stats | null {
  if (typeof raw !== "object" || raw === null) {
    return null
  }
  const record = raw as {
    total?: unknown
    byStatus?: unknown
    byType?: unknown
    ready?: unknown
    blocked?: unknown
  }
  if (typeof record.total !== "number" || !Array.isArray(record.byStatus)) {
    return null
  }
  const byStatus: StatusCount[] = []
  for (const entry of record.byStatus) {
    const decoded = decodeCount(entry)
    if (decoded === null) {
      return null
    }
    byStatus.push(decoded)
  }
  const byType: TypeCount[] = []
  if (record.byType !== undefined) {
    if (!Array.isArray(record.byType)) {
      return null
    }
    for (const entry of record.byType) {
      const decoded = decodeType(entry)
      if (decoded === null) {
        return null
      }
      byType.push(decoded)
    }
  }
  return {
    total: record.total,
    byStatus,
    byType,
    ...(typeof record.ready === "number" ? { ready: record.ready } : {}),
    ...(typeof record.blocked === "number" ? { blocked: record.blocked } : {}),
  }
}

export function toSnapshot(stats: Stats): Stats {
  return {
    total: stats.total,
    byStatus: stats.byStatus.map((entry) => ({ status: entry.status, count: entry.count })),
    byType: (stats.byType ?? []).map((entry) => ({ type: entry.type, count: entry.count })),
    ...(stats.ready === undefined ? {} : { ready: stats.ready }),
    ...(stats.blocked === undefined ? {} : { blocked: stats.blocked }),
  }
}

export interface CachePort {
  read(directory: string): unknown
  write(directory: string, stats: Stats): void
}

export interface Cache {
  seed(): Stats | null
  save(stats: Stats): void
}

export function createCache(port: CachePort, directory: string): Cache {
  return {
    seed() {
      return decodeStats(port.read(directory))
    },
    save(stats) {
      port.write(directory, toSnapshot(stats))
    },
  }
}
