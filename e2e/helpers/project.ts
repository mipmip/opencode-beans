import { execFile } from "node:child_process"
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { createIsolatedDirs, isolatedEnv, repoRoot, type IsolatedDirs } from "./env.ts"
import { MOCK_API_KEY_ENV, MOCK_PROVIDER_ID } from "./mock-provider.ts"

const run = promisify(execFile)

export type E2eBean = {
  id: string
  status: string
}

export type E2eProject = {
  dir: string
  dirs: IsolatedDirs
  env: NodeJS.ProcessEnv
  dispose: () => Promise<void>
}

export type E2eProjectOptions = {
  tracker?: boolean
  beans?: Array<{ title: string; status?: string }>
  provider?: { baseURL: string; model: string }
}

const defaultBeans = [
  { title: "first", status: "todo" },
  { title: "second", status: "in-progress" },
  { title: "third", status: "completed" },
]

export async function createE2eProject(options: E2eProjectOptions = {}): Promise<E2eProject> {
  const dir = await mkdtemp(join(tmpdir(), "opencode-beans-e2e-"))
  const dirs = await createIsolatedDirs(dir)

  if (options.tracker !== false) {
    await run("beans", ["init"], { cwd: dir })
    for (const bean of options.beans ?? defaultBeans) {
      await run("beans", ["create", bean.title, "-s", bean.status ?? "todo"], { cwd: dir })
    }
  }

  await mkdir(join(dir, ".opencode", "plugins"), { recursive: true })
  await cp(join(repoRoot, ".opencode", "plugins", "beans-stats"), join(dir, ".opencode", "plugins", "beans-stats"), {
    recursive: true,
  })
  await symlink(join(repoRoot, "node_modules"), join(dir, "node_modules"), "dir")

  const env = isolatedEnv(dirs)
  if (options.provider) {
    env[MOCK_API_KEY_ENV] = "e2e"
    await writeFile(
      join(dir, "opencode.jsonc"),
      JSON.stringify(providerConfig(options.provider.baseURL, options.provider.model), null, 2),
    )
  }

  return {
    dir,
    dirs,
    env,
    dispose: () => rm(dir, { recursive: true, force: true }),
  }
}

function providerConfig(baseURL: string, model: string): Record<string, unknown> {
  const modelID = model.split("/")[1] ?? model
  return {
    $schema: "https://opencode.ai/config.json",
    model,
    providers: {
      [MOCK_PROVIDER_ID]: {
        name: "End to end provider",
        env: [MOCK_API_KEY_ENV],
        package: "@opencode/ai/providers/openai-compatible",
        settings: { baseURL },
        models: { [modelID]: { name: "End to end model", capabilities: { tools: false } } },
      },
    },
  }
}

export async function listBeans(dir: string): Promise<E2eBean[]> {
  const { stdout } = await run("beans", ["list", "--json"], { cwd: dir })
  return JSON.parse(stdout) as E2eBean[]
}
