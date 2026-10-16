#!/usr/bin/env python3
"""Run a command inside a pseudo terminal and print the raw captured output.

Usage:
    pty.py --cols N --rows N --timeout SECONDS --cwd DIR -- CMD [ARGS...]

The helper is intentionally dependency free so it works on the host and inside
the nix development shell. It exists because Node has no built in pseudo
terminal API.
"""

import argparse
import fcntl
import os
import select
import signal
import struct
import sys
import termios
import time


def parse_args(argv):
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--cols", type=int, default=160)
    parser.add_argument("--rows", type=int, default=45)
    parser.add_argument("--timeout", type=float, default=25.0)
    parser.add_argument("--cwd", default=os.getcwd())
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    command = args.command
    if command and command[0] == "--":
        command = command[1:]
    if not command:
        parser.error("no command given")
    return args, command


def main(argv):
    args, command = parse_args(argv)

    pid, fd = os.forkpty()
    if pid == 0:
        os.chdir(args.cwd)
        try:
            os.execvp(command[0], command)
        except OSError as error:
            os.write(2, f"failed to exec {command[0]}: {error}\n".encode())
            os._exit(127)

    fcntl.ioctl(
        fd,
        termios.TIOCSWINSZ,
        struct.pack("HHHH", args.rows, args.cols, 0, 0),
    )

    buffer = bytearray()
    deadline = time.time() + args.timeout
    while time.time() < deadline:
        ready, _, _ = select.select([fd], [], [], 0.2)
        if ready:
            try:
                chunk = os.read(fd, 65536)
            except OSError:
                break
            if not chunk:
                break
            buffer.extend(chunk)

    for sig in (signal.SIGTERM, signal.SIGKILL):
        try:
            os.killpg(pid, sig)
        except (ProcessLookupError, PermissionError):
            break
        time.sleep(0.2)
        try:
            os.waitpid(pid, os.WNOHANG)
        except ChildProcessError:
            break

    sys.stdout.buffer.write(bytes(buffer))
    sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
