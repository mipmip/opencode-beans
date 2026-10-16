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

export interface SectionLayout {
  readonly total: string
  readonly body: readonly string[]
}

interface Cell {
  readonly label: string
  readonly count: number
  readonly bar?: string
}

interface ColumnWidths {
  readonly label: number
  readonly count: number
}

const BAR_WIDTH = 4
const FULL_BLOCK = "█"
const HALF_BLOCK = "▌"
const LABEL_GUTTER = 2
const COUNT_GUTTER = 2
const BAR_GAP = "  "

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

export function layoutSection(stats: Stats): SectionLayout {
  return layout(stats, false)
}

export function layoutBreakdown(stats: Stats): SectionLayout {
  return layout(stats, true)
}

function layout(stats: Stats, withTypes: boolean): SectionLayout {
  const statuses = bars(statusRows(stats)).map((row) => ({
    label: row.status,
    count: row.count,
    bar: row.bar,
  }))
  const summary = summaryLines(stats).map((line) => ({ label: line.label, count: line.count }))
  const types = bars(typeRows(stats)).map((row) => ({ label: row.type, count: row.count, bar: row.bar }))
  const widths = columnWidths(withTypes ? [...statuses, ...summary, ...types] : [...statuses, ...summary])

  const body: string[] = []
  appendBlock(body, statuses, widths)
  appendBlock(body, summary, widths)
  if (withTypes) {
    appendBlock(body, types, widths)
  }
  return { total: totalLabel(stats), body }
}

function appendBlock(body: string[], cells: readonly Cell[], widths: ColumnWidths): void {
  if (cells.length === 0) {
    return
  }
  body.push("", ...cells.map((cell) => renderCell(cell, widths)))
}

function columnWidths(cells: readonly Cell[]): ColumnWidths {
  const label = cells.reduce((width, cell) => Math.max(width, cell.label.length), 0) + LABEL_GUTTER
  const count = cells.reduce((width, cell) => Math.max(width, String(cell.count).length), 0) + COUNT_GUTTER
  return { label, count }
}

function renderCell(cell: Cell, widths: ColumnWidths): string {
  const label = cell.label.padEnd(widths.label)
  const count = String(cell.count).padStart(widths.count)
  return cell.bar ? label + count + BAR_GAP + cell.bar : label + count
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
