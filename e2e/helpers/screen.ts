const CSI = "\u001b["
const OSC = "\u001b]"

type Grid = string[][]

function emptyGrid(cols: number, rows: number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => " "))
}

function clearLine(grid: Grid, row: number, mode: number, x: number, cols: number) {
  const line = grid[row]
  if (!line) return
  if (mode === 2) {
    for (let cx = 0; cx < cols; cx += 1) line[cx] = " "
    return
  }
  if (mode === 1) {
    for (let cx = 0; cx <= x && cx < cols; cx += 1) line[cx] = " "
    return
  }
  for (let cx = x; cx < cols; cx += 1) line[cx] = " "
}

function applyCsi(
  grid: Grid,
  params: string,
  final: string,
  cursor: { x: number; y: number },
  cols: number,
  rows: number,
) {
  const numbers = params
    .split(";")
    .filter((part) => part.length > 0)
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value))
  const first = numbers[0] ?? 1

  if (final === "H" || final === "f") {
    const row = numbers[0] && numbers[0] > 0 ? numbers[0] - 1 : 0
    const col = numbers[1] && numbers[1] > 0 ? numbers[1] - 1 : 0
    cursor.y = Math.min(rows - 1, Math.max(0, row))
    cursor.x = Math.min(cols - 1, Math.max(0, col))
    return
  }

  if (final === "J") {
    const mode = numbers[0] ?? 0
    if (mode === 2) {
      for (let row = 0; row < rows; row += 1) clearLine(grid, row, 2, cursor.x, cols)
    } else if (mode === 0) {
      clearLine(grid, cursor.y, 0, cursor.x, cols)
      for (let row = cursor.y + 1; row < rows; row += 1) clearLine(grid, row, 2, cursor.x, cols)
    } else if (mode === 1) {
      for (let row = 0; row < cursor.y; row += 1) clearLine(grid, row, 2, cursor.x, cols)
      clearLine(grid, cursor.y, 1, cursor.x, cols)
    }
    return
  }

  if (final === "K") {
    clearLine(grid, cursor.y, numbers[0] ?? 0, cursor.x, cols)
    return
  }

  if (final === "A") cursor.y = Math.max(0, cursor.y - first)
  else if (final === "B") cursor.y = Math.min(rows - 1, cursor.y + first)
  else if (final === "C") cursor.x = Math.min(cols - 1, cursor.x + first)
  else if (final === "D") cursor.x = Math.max(0, cursor.x - first)
  else if (final === "G") cursor.x = Math.max(0, (numbers[0] ?? 1) - 1)
  else if (final === "d") cursor.y = Math.max(0, (numbers[0] ?? 1) - 1)
}

export function renderScreen(data: string, cols: number, rows: number): string[] {
  const grid = emptyGrid(cols, rows)
  const cursor = { x: 0, y: 0 }
  let index = 0

  while (index < data.length) {
    const ch = data[index] ?? ""

    if (ch === "\u001b") {
      const next = data[index + 1] ?? ""
      if (next === "[") {
        let end = index + 2
        while (end < data.length && !(data[end]! >= "@" && data[end]! <= "~")) end += 1
        const params = data.slice(index + 2, end)
        const final = data[end] ?? ""
        applyCsi(grid, params, final, cursor, cols, rows)
        index = end + 1
        continue
      }
      if (next === "]") {
        let end = index + 2
        while (end < data.length && data[end] !== "\u0007" && data[end] !== "\u001b") end += 1
        index = end + 1
        continue
      }
      index += 2
      continue
    }

    if (ch === "\r") {
      cursor.x = 0
    } else if (ch === "\n") {
      cursor.y = Math.min(rows - 1, cursor.y + 1)
    } else if (ch === "\b") {
      cursor.x = Math.max(0, cursor.x - 1)
    } else if (ch === "\t") {
      cursor.x = Math.min(cols - 1, cursor.x + 8)
    } else if (ch >= " ") {
      const line = grid[cursor.y]
      if (line && cursor.x >= 0 && cursor.x < cols) line[cursor.x] = ch
      cursor.x = Math.min(cols - 1, cursor.x + 1)
    }
    index += 1
  }

  return grid.map((line) => line.join("").replace(/\s+$/, ""))
}

export function sidebarRegion(lines: string[], header = "BEANS"): string[] {
  const column = lines.reduce((found, line) => {
    const at = line.indexOf(header)
    return at >= 0 && (found < 0 || at < found) ? at : found
  }, -1)
  if (column < 0) return []
  return lines.map((line) => line.slice(column))
}
