import { execFile } from "node:child_process"
import { access, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const run = promisify(execFile)

export const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

export type Prerequisites = {
  opencode: boolean
  python: boolean
  dependencies: boolean
}

export async function hasCommand(command: string): Promise<boolean> {
  try {
    await run(command, ["--version"])
    return true
  } catch {
    return false
  }
}

async function hasPluginDependencies(): Promise<boolean> {
  try {
    await access(join(repoRoot, "node_modules", "@opencode", "plugin"))
    return true
  } catch {
    return false
  }
}

export async function checkPrerequisites(): Promise<Prerequisites> {
  const [opencode, python, dependencies] = await Promise.all([
    hasCommand("opencode"),
    hasCommand("python3"),
    hasPluginDependencies(),
  ])
  return { opencode, python, dependencies }
}

export function skipReason(prerequisites: Prerequisites): string | false {
  if (!prerequisites.opencode) return "opencode is not available"
  if (!prerequisites.python) return "python3 is not available"
  if (!prerequisites.dependencies) return "plugin dependencies are not installed (run npm install)"
  return false
}

export type IsolatedDirs = {
  home: string
  data: string
  config: string
  cache: string
}

export async function createIsolatedDirs(root: string): Promise<IsolatedDirs> {
  const dirs: IsolatedDirs = {
    home: join(root, "home"),
    data: join(root, "xdg-data"),
    config: join(root, "xdg-config"),
    cache: join(root, "xdg-cache"),
  }
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })))
  return dirs
}

export function isolatedEnv(dirs: IsolatedDirs): NodeJS.ProcessEnv {
  const base: NodeJS.ProcessEnv = { ...process.env }
  delete base["OPENCODE_SERVER"]
  delete base["OPENCODE_CLI_CONFIG_CONTENT"]
  return {
    ...base,
    HOME: dirs.home,
    XDG_DATA_HOME: dirs.data,
    XDG_CONFIG_HOME: dirs.config,
    XDG_CACHE_HOME: dirs.cache,
  }
}
