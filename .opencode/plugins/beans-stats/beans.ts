import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { Stats } from "./layout.ts"

const run = promisify(execFile)
const MAX_BUFFER = 8 * 1024 * 1024

export const DEFAULT_TIMEOUT_MS = 5_000

export interface LoadOptions {
  readonly signal?: AbortSignal
  readonly timeoutMs?: number
}

export interface ExecOptions {
  readonly cwd: string
  readonly maxBuffer: number
  readonly timeout: number
  readonly signal?: AbortSignal
}

export interface ExecResult {
  readonly stdout: string
}

export type ExecFile = (
  command: string,
  args: readonly string[],
  options: ExecOptions,
) => Promise<ExecResult>

export interface BeanRecord {
  readonly status: string
  readonly type?: string
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
    const record = entry as { status?: unknown; type?: unknown } | null
    const status = record?.status
    if (typeof status !== "string") {
      throw new BeansUnavailableError("a bean is missing its status")
    }
    const type = record?.type
    return typeof type === "string" ? { status, type } : { status }
  })
}

export function aggregate(
  beans: readonly BeanRecord[],
  ready?: number,
  blocked?: number,
): Stats {
  const counts = new Map<string, number>()
  const types = new Map<string, number>()
  for (const bean of beans) {
    counts.set(bean.status, (counts.get(bean.status) ?? 0) + 1)
    if (bean.type !== undefined) {
      types.set(bean.type, (types.get(bean.type) ?? 0) + 1)
    }
  }
  return {
    total: beans.length,
    byStatus: [...counts].map(([status, count]) => ({ status, count })),
    byType: [...types].map(([type, count]) => ({ type, count })),
    ...(ready === undefined ? {} : { ready }),
    ...(blocked === undefined ? {} : { blocked }),
  }
}

export interface BeanReader {
  loadStats(dir: string, options?: LoadOptions): Promise<Stats>
}

export function createBeanReader(exec: ExecFile): BeanReader {
  const list = async (
    dir: string,
    args: string[],
    options: LoadOptions,
  ): Promise<BeanRecord[]> => {
    const { stdout } = await exec("beans", args, {
      cwd: dir,
      maxBuffer: MAX_BUFFER,
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
    return parseBeans(stdout)
  }

  const count = async (
    dir: string,
    args: string[],
    options: LoadOptions,
  ): Promise<number | undefined> => {
    try {
      return (await list(dir, args, options)).length
    } catch {
      return undefined
    }
  }

  return {
    async loadStats(dir: string, options: LoadOptions = {}): Promise<Stats> {
      let beans: BeanRecord[]
      try {
        beans = await list(dir, ["list", "--json"], options)
      } catch {
        throw new BeansUnavailableError("beans list --json failed")
      }
      const ready = await count(dir, ["list", "--ready", "--json"], options)
      const blocked = await count(dir, ["list", "--is-blocked", "--json"], options)
      return aggregate(beans, ready, blocked)
    },
  }
}

const defaultExec: ExecFile = async (command, args, options) => {
  const { stdout } = await run(command, [...args], { ...options })
  return { stdout }
}

export const { loadStats } = createBeanReader(defaultExec)
