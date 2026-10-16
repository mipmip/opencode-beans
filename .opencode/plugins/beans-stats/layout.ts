export interface StatusCount {
  readonly status: string
  readonly count: number
}

export interface TypeCount {
  readonly type: string
  readonly count: number
}

export interface Stats {
  readonly total: number
  readonly byStatus: readonly StatusCount[]
  readonly byType?: readonly TypeCount[]
  readonly ready?: number
  readonly blocked?: number
}

export interface SummaryLine {
  readonly label: string
  readonly count: number
}

const BAR_WIDTH = 4
const FULL_BLOCK = "█"
const HALF_BLOCK = "▌"

export function statusRows(stats: Stats): StatusCount[] {
  return [...stats.byStatus].sort(
    (left, right) => right.count - left.count || left.status.localeCompare(right.status),
  )
}

export function typeRows(stats: Stats): TypeCount[] {
  return [...(stats.byType ?? [])].sort(
    (left, right) => right.count - left.count || left.type.localeCompare(right.type),
  )
}

export function bars<T extends { readonly count: number }>(
  entries: readonly T[],
  width: number = BAR_WIDTH,
): Array<T & { readonly bar: string }> {
  const max = entries.reduce((largest, entry) => Math.max(largest, entry.count), 0)
  return entries.map((entry) => ({ ...entry, bar: bar(entry.count, max, width) }))
}

export function bar(count: number, max: number, width: number = BAR_WIDTH): string {
  if (max <= 0 || count <= 0) {
    return ""
  }
  const steps = Math.min(width * 2, Math.round((count / max) * width * 2))
  const full = Math.floor(steps / 2)
  const half = steps % 2 === 1
  return FULL_BLOCK.repeat(full) + (half ? HALF_BLOCK : "")
}

export function totalLabel(stats: Stats): string {
  return `${stats.total} total`
}

export function summaryLines(stats: Stats): SummaryLine[] {
  const lines: SummaryLine[] = []
  if (stats.ready !== undefined) {
    lines.push({ label: "ready", count: stats.ready })
  }
  if (stats.blocked !== undefined) {
    lines.push({ label: "blocked", count: stats.blocked })
  }
  return lines
}
