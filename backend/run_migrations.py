"""Run Alembic migrations with full error output."""

import subprocess
import sys


def main():
    print("Running database migrations...", flush=True)
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
    )

    if result.stdout:
        print(f"STDOUT: {result.stdout}", flush=True)
    if result.stderr:
        print(f"STDERR: {result.stderr}", flush=True)

    if result.returncode != 0:
        print(f"Migration FAILED with exit code {result.returncode}", flush=True)
        sys.exit(1)

    print("Migrations completed successfully!", flush=True)


if __name__ == "__main__":
    main()
