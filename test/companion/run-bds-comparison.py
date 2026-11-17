"""Read-only same-seed world generation comparison on the official BDS binary."""
import json
import os
from pathlib import Path
from queue import Empty, Queue
import re
import subprocess
import sys
from threading import Thread
import time


def run(root, mode, seed):
    with (root / "server.properties").open("w", encoding="utf-8") as f:
        f.write(f"level-name={mode}-{seed}\nlevel-seed={seed}\nallow-cheats=true\nonline-mode=false\nserver-port=39132\nserver-portv6=39133\nview-distance=10\ntick-distance=4\npause-when-empty-seconds=0\ncontent-log-file-enabled=true\n")
    template = root / "worlds" / mode / "world_behavior_packs.json"
    scenario = root / "worlds" / f"{mode}-{seed}"
    scenario.mkdir()
    (scenario / template.name).write_bytes(template.read_bytes())
    process = subprocess.Popen(
        ["./bedrock_server"], cwd=root, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT, text=True, bufsize=1, env={**os.environ, "LD_LIBRARY_PATH": str(root)}
    )
    queue = Queue()

    def gather():
        for line in process.stdout:
            print(f"[{mode}/{seed}] {line}", end="", flush=True)
            queue.put(line)
        queue.put(None)

    Thread(target=gather, daemon=True).start()

    def send(command):
        process.stdin.write(command + "\n")
        process.stdin.flush()

    def expect(predicate, timeout):
        end = time.monotonic() + timeout
        while time.monotonic() < end:
            try:
                line = queue.get(timeout=max(0.01, end - time.monotonic()))
            except Empty:
                break
            if line is None:
                raise RuntimeError("Bedrock exited before sending test evidence")
            result = predicate(line)
            if result is not None:
                return result
        raise TimeoutError(f"No matching Bedrock output for {mode}/{seed}")

    def parse(line):
        match = re.search(r"J2B_SMOKE (\{.*\})", line)
        return json.loads(match[1]) if match else None

    try:
        expect(lambda line: True if "Server started" in line else None, 80)
        send("tickingarea add -64 64 -64 63 64 63 j2b_ci true")
        time.sleep(12)
        send("scriptevent j2b_ci:scan test")
        return expect(parse, 120)
    finally:
        if process.poll() is None:
            try:
                send("stop")
                process.wait(timeout=20)
            except (BrokenPipeError, subprocess.TimeoutExpired):
                process.kill()
                process.wait()


def main():
    root = Path(sys.argv[1]).resolve()
    for seed in (12345, 314159):
        off = run(root, "control", seed)
        on = run(root, "candidate", seed)
        print(json.dumps({"seed": seed, "control": off, "candidate": on}), flush=True)
        if any(r["loaded"] != 112**2 or r["missing"] for r in (off, on)):
            raise SystemExit("Inconclusive: scan had unavailable columns")
        if off["converted"] or off["vanilla"] == 0:
            raise SystemExit("Inconclusive: control must contain vanilla oak and no custom oak")
        if not on["converted"]:
            continue
        if off["hash"] != on["hash"] or off["vanilla"] != on["vanilla"] + on["converted"]:
            raise SystemExit("FAIL: custom leaves changed canopy positions or duplicated generation")
        print("PASS: same-seed canopy coordinates match, with direct custom block placements")
        return
    raise SystemExit("FAIL: no direct custom oak placements observed")


if __name__ == "__main__":
    main()
