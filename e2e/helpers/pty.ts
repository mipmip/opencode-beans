import { execFile } from "node:child_process"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const run = promisify(execFile)

export const ptyHelper = fileURLToPath(new URL("./pty.py", import.meta.url))

export type CaptureOptions = {
  cwd: string
  env: NodeJS.ProcessEnv
  command: string[]
  cols?: number
  rows?: number
  timeout?: number
}

export async function capturePty(options: CaptureOptions): Promise<string> {
  const { stdout } = await run(
    "python3",
    [
      ptyHelper,
      "--cols",
      String(options.cols ?? 160),
      "--rows",
      String(options.rows ?? 45),
      "--timeout",
      String(options.timeout ?? 25),
      "--cwd",
      options.cwd,
      "--",
      ...options.command,
    ],
    {
      cwd: options.cwd,
      env: options.env,
      maxBuffer: 64 * 1024 * 1024,
      encoding: "utf8",
    },
  )
  return stdout
}
