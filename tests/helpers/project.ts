import { execFile } from "node:child_process"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)

export type Bean = {
  id: string
  title: string
  status: string
  type: string
}

export type Fixture = {
  dir: string
  dispose: () => Promise<void>
}

export async function hasBeans(): Promise<boolean> {
  try {
    await run("beans", ["version"])
    return true
  } catch {
    return false
  }
}

export async function createProject(): Promise<Fixture> {
  const dir = await mkdtemp(join(tmpdir(), "opencode-beans-"))
  await run("beans", ["init"], { cwd: dir })
  return {
    dir,
    dispose: () => rm(dir, { recursive: true, force: true }),
  }
}

export async function createBean(
  dir: string,
  title: string,
  status = "todo",
): Promise<string> {
  const { stdout } = await run("beans", ["create", "--json", title, "-s", status], {
    cwd: dir,
  })
  return (JSON.parse(stdout) as { id: string }).id
}

export async function listBeans(dir: string): Promise<Bean[]> {
  const { stdout } = await run("beans", ["list", "--json"], { cwd: dir })
  return JSON.parse(stdout) as Bean[]
}
