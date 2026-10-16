export interface StatusCount {
  readonly status: string
  readonly count: number
}

export interface Stats {
  readonly total: number
  readonly byStatus: readonly StatusCount[]
}

const BAR_WIDTH = 4
const FULL_BLOCK = "█"
const HALF_BLOCK = "▌"

export function statusRows(stats: Stats): StatusCount[] {
  return [...stats.byStatus].sort(
    (left, right) => right.count - left.count || left.status.localeCompare(right.status),
  )
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
