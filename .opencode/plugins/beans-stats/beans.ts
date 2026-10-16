import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { Stats } from "./layout.ts"

const run = promisify(execFile)
const MAX_BUFFER = 8 * 1024 * 1024

export interface BeanRecord {
  readonly status: string
}

export class BeansUnavailableError extends Error {}

export function parseBeans(raw: string): BeanRecord[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new BeansUnavailableError("beans list --json did not return JSON")
  }
  if (!Array.isArray(parsed)) {
    throw new BeansUnavailableError("beans list --json did not return an array")
  }
  return parsed.map((entry) => {
    const status = (entry as { status?: unknown } | null)?.status
    if (typeof status !== "string") {
      throw new BeansUnavailableError("a bean is missing its status")
    }
    return { status }
  })
}

export function aggregate(
  beans: readonly BeanRecord[],
  ready?: number,
  blocked?: number,
): Stats {
  const counts = new Map<string, number>()
  for (const bean of beans) {
    counts.set(bean.status, (counts.get(bean.status) ?? 0) + 1)
  }
  return {
    total: beans.length,
    byStatus: [...counts].map(([status, count]) => ({ status, count })),
    ...(ready === undefined ? {} : { ready }),
    ...(blocked === undefined ? {} : { blocked }),
  }
}

async function list(dir: string, args: string[]): Promise<BeanRecord[]> {
  const { stdout } = await run("beans", args, { cwd: dir, maxBuffer: MAX_BUFFER })
  return parseBeans(stdout)
}

async function count(dir: string, args: string[]): Promise<number | undefined> {
  try {
    return (await list(dir, args)).length
  } catch {
    return undefined
  }
}

export async function loadStats(dir: string): Promise<Stats> {
  let beans: BeanRecord[]
  try {
    beans = await list(dir, ["list", "--json"])
  } catch {
    throw new BeansUnavailableError("beans list --json failed")
  }
  const ready = await count(dir, ["list", "--ready", "--json"])
  const blocked = await count(dir, ["list", "--is-blocked", "--json"])
  return aggregate(beans, ready, blocked)
}
