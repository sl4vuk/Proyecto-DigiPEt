#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DigiPET -- Smart TUI Launcher
Single-script installer, runner, builder and cleaner for Tauri / npm projects.
Compatible with Windows CP850/CP437 terminals and modern UTF-8 terminals.
"""

import curses
import subprocess
import shutil
import sys
import os
import glob
import time
import threading
from pathlib import Path

# ---------------------------------------------------------------------------
#  FORCE UTF-8 OUTPUT ON WINDOWS  (must happen before curses starts)
# ---------------------------------------------------------------------------
if sys.platform == "win32":
    import ctypes
    # Set console code page to UTF-8
    ctypes.windll.kernel32.SetConsoleOutputCP(65001)
    ctypes.windll.kernel32.SetConsoleCP(65001)
    # Enable VT / ANSI processing
    kernel = ctypes.windll.kernel32
    handle = kernel.GetStdHandle(-11)
    mode   = ctypes.c_ulong()
    kernel.GetConsoleMode(handle, ctypes.byref(mode))
    kernel.SetConsoleMode(handle, mode.value | 0x0004)
    # Reconfigure stdout/stderr to UTF-8
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
#  COLOR PAIR IDs
# ---------------------------------------------------------------------------
P_NORMAL   = 1
P_ACCENT   = 2
P_WARN     = 3
P_ERR      = 4
P_OK       = 5
P_SELECTED = 6
P_DIM      = 7
P_BANNER   = 8
P_BORDER   = 9
P_TITLE    = 10

def init_colors():
    curses.start_color()
    try:
        curses.use_default_colors()
        bg = -1
    except Exception:
        bg = curses.COLOR_BLACK
    curses.init_pair(P_NORMAL,   curses.COLOR_WHITE,   bg)
    curses.init_pair(P_ACCENT,   curses.COLOR_CYAN,    bg)
    curses.init_pair(P_WARN,     curses.COLOR_YELLOW,  bg)
    curses.init_pair(P_ERR,      curses.COLOR_RED,     bg)
    curses.init_pair(P_OK,       curses.COLOR_GREEN,   bg)
    curses.init_pair(P_SELECTED, curses.COLOR_BLACK,   curses.COLOR_CYAN)
    try:
        curses.init_pair(P_DIM, 8, bg)   # dark grey (bright black)
    except Exception:
        curses.init_pair(P_DIM, curses.COLOR_WHITE, bg)
    curses.init_pair(P_BANNER,   curses.COLOR_MAGENTA, bg)
    curses.init_pair(P_BORDER,   curses.COLOR_CYAN,    bg)
    curses.init_pair(P_TITLE,    curses.COLOR_WHITE,   bg)

# ---------------------------------------------------------------------------
#  BANNER  -- pure 7-bit ASCII, zero box-drawing chars
# ---------------------------------------------------------------------------
BANNER_LINES = [
    r"  ########  ####  ######   ####  ########  ########  ########",
    r"  ##     ##  ##  ##    ##  ##  ##  ##      ##           ##   ",
    r"  ##     ##  ##  ##        ######  ######  ######       ##   ",
    r"  ##     ##  ##  ##    ##  ##  ##  ##      ##           ##   ",
    r"  ########  ####  ######   ##  ##  ##      ########     ##   ",
]
SUBTITLE = "[ TAURI PROJECT SMART LAUNCHER  v2.1 ]"

# ---------------------------------------------------------------------------
#  MENU
# ---------------------------------------------------------------------------
class Action:
    DEPS   = "deps"
    RUN    = "run"
    BUILD  = "build"
    CLEAN  = "clean"
    DEEP   = "deep"
    DOCTOR = "doctor"
    QUIT   = "quit"

MENU_ITEMS = [
    (Action.DEPS,   "  [1]  Install Dependencies",         "winget + Node + Rust + VS BuildTools + WebView2"),
    (Action.RUN,    "  [2]  Run in Dev Mode",              "npm run tauri dev  --  hot reload enabled"),
    (Action.BUILD,  "  [3]  Build Release  (.exe)",        "tauri build  ->  DigiPET_Portable/DigiPET.exe"),
    (Action.CLEAN,  "  [4]  Smart Clean",                  "logs, temp files, stale build artifacts"),
    (Action.DEEP,   "  [5]  Deep Clean  (+ node_modules)", "full reset -- removes node_modules & Cargo cache"),
    (Action.DOCTOR, "  [6]  Environment Doctor",           "check all tools and report status"),
    (Action.QUIT,   "  [7]  Exit",                         "bye o/"),
]

# ---------------------------------------------------------------------------
#  HELPERS
# ---------------------------------------------------------------------------
def run_cmd(cmd: str):
    """Return (returncode, output_str)."""
    proc = subprocess.run(
        cmd, shell=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding="utf-8", errors="replace"
    )
    return proc.returncode, (proc.stdout or "").strip()

def cmd_exists(name: str) -> bool:
    return shutil.which(name) is not None

def safe_remove(path):
    p = Path(path)
    try:
        if p.is_file() or p.is_symlink():
            p.unlink()
        elif p.is_dir():
            shutil.rmtree(p, ignore_errors=True)
    except Exception:
        pass

# ---------------------------------------------------------------------------
#  SAFE DRAW
# ---------------------------------------------------------------------------
def safe_addstr(win, y, x, text, attr=0):
    """addstr that never raises."""
    try:
        max_y, max_x = win.getmaxyx()
        if y < 0 or y >= max_y - 1 or x < 0:
            return
        avail = max_x - x - 1
        if avail <= 0:
            return
        win.addstr(y, x, text[:avail], attr)
    except (curses.error, UnicodeEncodeError, ValueError):
        pass

def draw_border(win):
    """Plain ASCII border -- safe on every Windows code page."""
    try:
        h, w = win.getmaxyx()
        attr = curses.color_pair(P_BORDER) | curses.A_BOLD
        safe_addstr(win, 0,     0,     "+", attr)
        safe_addstr(win, 0,     w - 1, "+", attr)
        safe_addstr(win, h - 1, 0,     "+", attr)
        safe_addstr(win, h - 1, w - 1, "+", attr)
        safe_addstr(win, 0,     1, "-" * (w - 2), attr)
        safe_addstr(win, h - 1, 1, "-" * (w - 2), attr)
        for row in range(1, h - 1):
            safe_addstr(win, row, 0,     "|", attr)
            safe_addstr(win, row, w - 1, "|", attr)
    except curses.error:
        pass

def draw_hline(win, y, color_pair):
    try:
        _, w = win.getmaxyx()
        safe_addstr(win, y, 1, "-" * (w - 2), curses.color_pair(color_pair))
    except curses.error:
        pass

# ---------------------------------------------------------------------------
#  BANNER DRAW
# ---------------------------------------------------------------------------
def draw_banner(win, start_y: int) -> int:
    _, w = win.getmaxyx()
    for i, line in enumerate(BANNER_LINES):
        x = max(1, (w - len(line)) // 2)
        safe_addstr(win, start_y + i, x, line,
                    curses.color_pair(P_BANNER) | curses.A_BOLD)
    sub_y = start_y + len(BANNER_LINES) + 1
    sx = max(1, (w - len(SUBTITLE)) // 2)
    safe_addstr(win, sub_y, sx, SUBTITLE,
                curses.color_pair(P_ACCENT) | curses.A_BOLD)
    return sub_y + 2

# ---------------------------------------------------------------------------
#  MENU DRAW
# ---------------------------------------------------------------------------
def draw_menu(win, items, selected, top_y):
    _, w = win.getmaxyx()
    for i, (action, label, desc) in enumerate(items):
        y = top_y + i * 2
        is_sel = (i == selected)
        if is_sel:
            safe_addstr(win, y, 2, " " * (w - 4),
                        curses.color_pair(P_SELECTED) | curses.A_BOLD)
            safe_addstr(win, y, 2, label,
                        curses.color_pair(P_SELECTED) | curses.A_BOLD)
            safe_addstr(win, y, 42, "| " + desc,
                        curses.color_pair(P_DIM) | curses.A_BOLD)
        else:
            if action == Action.QUIT:
                lattr = curses.color_pair(P_ERR) | curses.A_BOLD
            elif action in (Action.CLEAN, Action.DEEP):
                lattr = curses.color_pair(P_WARN) | curses.A_BOLD
            elif action == Action.DOCTOR:
                lattr = curses.color_pair(P_ACCENT) | curses.A_BOLD
            else:
                lattr = curses.color_pair(P_NORMAL) | curses.A_BOLD
            safe_addstr(win, y, 2, label, lattr)
            safe_addstr(win, y, 42, "| " + desc, curses.color_pair(P_DIM))

# ---------------------------------------------------------------------------
#  TASK GENERATORS  (yield ("kind", "message"))
# ---------------------------------------------------------------------------
def task_deps():
    yield ("info", "Checking winget...")
    if not cmd_exists("winget"):
        yield ("err", "winget not found -- run on Windows 10/11 with App Installer")
        return
    yield ("ok", "winget detected")

    for bin_name, pkg_id in [("node", "OpenJS.NodeJS.LTS"), ("rustc", "Rustlang.Rustup")]:
        if cmd_exists(bin_name):
            yield ("ok", f"{bin_name} already installed")
        else:
            yield ("info", f"Installing {pkg_id}...")
            rc, out = run_cmd(
                f"winget install -e --id {pkg_id} "
                f"--accept-package-agreements --accept-source-agreements"
            )
            if rc == 0:
                yield ("ok", f"{pkg_id} installed")
            else:
                yield ("warn", f"{pkg_id} may need manual install: {out[:100]}")

    if cmd_exists("rustup"):
        yield ("info", "Setting Rust toolchain to stable-msvc...")
        run_cmd("rustup default stable-msvc")
        yield ("ok", "Rust toolchain: stable-msvc")
    else:
        yield ("err", "rustup not found -- restart terminal and retry")
        return

    yield ("info", "Checking VS Build Tools...")
    rc, _ = run_cmd("winget list -e --id Microsoft.VisualStudio.2022.BuildTools")
    if rc != 0:
        yield ("info", "Installing VS Build Tools (may take several minutes)...")
        run_cmd(
            "winget install -e --id Microsoft.VisualStudio.2022.BuildTools "
            "--accept-package-agreements --accept-source-agreements "
            '--override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools"'
        )
    yield ("ok", "VS Build Tools ready")

    yield ("info", "Checking WebView2 Runtime...")
    rc, _ = run_cmd("winget list -e --id Microsoft.EdgeWebView2Runtime")
    if rc != 0:
        run_cmd("winget install -e --id Microsoft.EdgeWebView2Runtime "
                "--accept-package-agreements --accept-source-agreements")
    yield ("ok", "WebView2 Runtime ready")

    if not Path("node_modules").exists():
        yield ("info", "Running npm install...")
        rc, out = run_cmd("npm install")
        if rc == 0:
            yield ("ok", "npm install complete")
        else:
            yield ("err", f"npm install failed: {out[:300]}")
            return
    else:
        yield ("ok", "node_modules already present")

    yield ("ok", "--- All dependencies ready ---")


def task_run():
    """Preflight only -- actual launch is done in main() after curses.endwin()."""
    yield ("info", "Verifying environment before launch...")
    for tool in ("node", "npm", "cargo"):
        if cmd_exists(tool):
            yield ("ok", f"{tool} found")
        else:
            yield ("err", f"{tool} not found -- run Install Dependencies first")
            return
    if not Path("package.json").exists():
        yield ("err", "package.json missing -- run from project root")
        return
    if not Path("node_modules").exists():
        yield ("warn", "node_modules missing -- run Install Dependencies first")
        return
    yield ("ok", "Environment OK -- launching dev server now...")


def task_build():
    yield ("info", "Pre-build smart clean...")
    yield from _do_smart_clean()
    yield ("info", "Starting Tauri release build...")
    yield ("accent", "CMD: npm exec -- tauri build")
    rc, out = run_cmd("npm exec -- tauri build")
    if rc != 0:
        for line in out.splitlines()[-25:]:
            yield ("err", line)
        yield ("err", "Build FAILED -- see output above")
        return

    exe_files = glob.glob("src-tauri/target/release/*.exe")
    if not exe_files:
        yield ("err", "No .exe found in src-tauri/target/release/")
        return

    out_dir = Path("DigiPET_Portable")
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir()
    dest = out_dir / "DigiPET.exe"
    shutil.copy(exe_files[0], dest)
    mb = dest.stat().st_size / 1_048_576
    yield ("ok", f"Executable -> {dest}  ({mb:.1f} MB)")
    yield ("ok", "--- Build complete ---")


def _do_smart_clean():
    removed = 0
    patterns = [
        "src-tauri/target/release/build",
        "src-tauri/target/release/deps",
        "src-tauri/target/release/incremental",
        "src-tauri/target/debug",
        "dist", ".vite",
        "*.log", "**/*.log",
        ".DS_Store", "**/.DS_Store",
        "Thumbs.db", "**/Thumbs.db",
        ".env.local",
        "__pycache__", "**/__pycache__",
        "*.pyc", "**/*.pyc",
    ]
    for pat in patterns:
        for match in glob.glob(pat, recursive=True):
            safe_remove(match)
            yield ("ok", f"Removed: {match}")
            removed += 1

    for f in Path(".").iterdir():
        if (f.is_file()
                and f.stat().st_size == 0
                and f.suffix not in (".ts", ".js", ".json", ".toml")):
            try:
                f.unlink()
                yield ("ok", f"Removed empty: {f}")
                removed += 1
            except Exception:
                pass

    yield ("ok", f"Smart clean done -- {removed} items removed")


def task_clean():
    yield ("info", "Running Smart Clean...")
    yield from _do_smart_clean()


def task_deep_clean():
    yield ("warn", "Deep Clean: removing node_modules and Cargo caches!")
    yield from _do_smart_clean()
    for p in [
        "node_modules",
        "src-tauri/target",
        str(Path.home() / ".cargo" / "registry" / "cache"),
    ]:
        pp = Path(p)
        if pp.exists():
            yield ("info", f"Removing {pp} ...")
            shutil.rmtree(pp, ignore_errors=True)
            yield ("ok", f"Removed {pp}")
        else:
            yield ("dim", f"Not found (skip): {pp}")
    yield ("ok", "--- Deep clean complete -- re-run Install Dependencies before next use ---")


def task_doctor():
    yield ("info", "Environment Doctor running...")
    checks = [
        ("node",   "Node.js",   "node --version"),
        ("npm",    "npm",       "npm --version"),
        ("rustc",  "Rust",      "rustc --version"),
        ("cargo",  "Cargo",     "cargo --version"),
        ("rustup", "Rustup",    "rustup --version"),
        ("git",    "Git",       "git --version"),
        ("winget", "Winget",    "winget --version"),
    ]
    for bin_name, label, ver_cmd in checks:
        if cmd_exists(bin_name):
            _, ver = run_cmd(ver_cmd)
            ver = ver.split("\n")[0][:45]
            yield ("ok",  f"{label:<18} {ver}")
        else:
            yield ("err", f"{label:<18} NOT FOUND")

    yield ("info", "Checking project structure...")
    for f in ["package.json", "src-tauri/tauri.conf.json", "src-tauri/Cargo.toml"]:
        if Path(f).exists():
            yield ("ok",   f"Found   : {f}")
        else:
            yield ("warn", f"Missing : {f}")

    if Path("node_modules").exists():
        yield ("ok",   "node_modules  : present")
    else:
        yield ("warn", "node_modules  : missing -- run Install Dependencies")

    rc, ver = run_cmd("npm exec -- tauri -V")
    if rc == 0:
        yield ("ok",   f"Tauri CLI     : {ver.strip()}")
    else:
        yield ("warn", "Tauri CLI     : not available (install deps first)")

    yield ("ok", "--- Doctor check complete ---")


TASK_MAP = {
    Action.DEPS:   task_deps,
    Action.RUN:    task_run,
    Action.BUILD:  task_build,
    Action.CLEAN:  task_clean,
    Action.DEEP:   task_deep_clean,
    Action.DOCTOR: task_doctor,
}

# ---------------------------------------------------------------------------
#  LOG SCREEN
# ---------------------------------------------------------------------------
LOG_COLOR = {
    "ok":     P_OK,
    "err":    P_ERR,
    "warn":   P_WARN,
    "info":   P_ACCENT,
    "dim":    P_DIM,
    "accent": P_BANNER,
}
LOG_PREFIX = {
    "ok":     "  [OK]  ",
    "err":    " [ERR]  ",
    "warn":   "[WARN]  ",
    "info":   "[INFO]  ",
    "dim":    "        ",
    "accent": "  >>>   ",
}

def run_task_screen(stdscr, action: str, label: str):
    curses.curs_set(0)
    logs: list = []
    done = False
    spin_frame = 0
    task_fn = TASK_MAP[action]

    def worker():
        nonlocal done
        for item in task_fn():
            logs.append(item)
        done = True

    t = threading.Thread(target=worker, daemon=True)
    t.start()

    while True:
        stdscr.erase()
        h, w = stdscr.getmaxyx()
        draw_border(stdscr)
        title = f"  >>  {label}  "
        safe_addstr(stdscr, 0, 3, title,
                    curses.color_pair(P_TITLE) | curses.A_BOLD)

        log_h = max(1, h - 6)
        visible = logs[-log_h:]
        for i, (kind, msg) in enumerate(visible):
            pfx   = LOG_PREFIX.get(kind, "        ")
            color = LOG_COLOR.get(kind, P_NORMAL)
            safe_addstr(stdscr, 2 + i, 1,
                        (pfx + msg)[:w - 2],
                        curses.color_pair(color))

        spin_chars = r"-\|/"
        if not done:
            safe_addstr(stdscr, h - 3, 2,
                        f"  {spin_chars[spin_frame % 4]}  Running...",
                        curses.color_pair(P_ACCENT) | curses.A_BOLD)
            spin_frame += 1
        else:
            safe_addstr(stdscr, h - 3, 2,
                        "  [DONE]  Press any key to return",
                        curses.color_pair(P_OK) | curses.A_BOLD)

        safe_addstr(stdscr, h - 1, 2, " DigiPET Launcher ",
                    curses.color_pair(P_DIM))
        stdscr.refresh()
        time.sleep(0.07)

        if done:
            t.join()
            # final repaint
            stdscr.erase()
            h, w = stdscr.getmaxyx()
            draw_border(stdscr)
            safe_addstr(stdscr, 0, 3, title,
                        curses.color_pair(P_TITLE) | curses.A_BOLD)
            log_h = max(1, h - 6)
            visible = logs[-log_h:]
            for i, (kind, msg) in enumerate(visible):
                pfx   = LOG_PREFIX.get(kind, "        ")
                color = LOG_COLOR.get(kind, P_NORMAL)
                safe_addstr(stdscr, 2 + i, 1,
                            (pfx + msg)[:w - 2],
                            curses.color_pair(color))
            safe_addstr(stdscr, h - 3, 2,
                        "  [DONE]  Press any key to return",
                        curses.color_pair(P_OK) | curses.A_BOLD)
            safe_addstr(stdscr, h - 1, 2, " DigiPET Launcher ",
                        curses.color_pair(P_DIM))
            stdscr.refresh()
            stdscr.nodelay(False)
            stdscr.getch()
            break

# ---------------------------------------------------------------------------
#  CONFIRM DIALOG
# ---------------------------------------------------------------------------
def confirm_dialog(stdscr, message: str) -> bool:
    h, w = stdscr.getmaxyx()
    dh, dw = 9, min(62, w - 4)
    dy, dx = max(0, (h - dh) // 2), max(0, (w - dw) // 2)
    win = curses.newwin(dh, dw, dy, dx)
    selected = 1   # 0=YES  1=NO

    words = message.split()
    lines_out, line = [], ""
    for word in words:
        if len(line) + len(word) + 1 > dw - 4:
            lines_out.append(line)
            line = word
        else:
            line = (line + " " + word).strip()
    if line:
        lines_out.append(line)

    while True:
        win.erase()
        draw_border(win)
        safe_addstr(win, 0, 3, "  [WARNING] Confirm Action  ",
                    curses.color_pair(P_WARN) | curses.A_BOLD)
        for i, l in enumerate(lines_out[:5]):
            safe_addstr(win, 2 + i, 2, l, curses.color_pair(P_NORMAL))

        btn_y = dh - 2
        yes_attr = (curses.color_pair(P_SELECTED) | curses.A_BOLD) if selected == 0 else curses.color_pair(P_OK)
        no_attr  = (curses.color_pair(P_SELECTED) | curses.A_BOLD) if selected == 1 else curses.color_pair(P_ERR)
        safe_addstr(win, btn_y, 12, "  YES  ", yes_attr)
        safe_addstr(win, btn_y, 25, "  NO   ", no_attr)
        win.refresh()

        key = stdscr.getch()
        if key in (curses.KEY_LEFT, curses.KEY_RIGHT, ord("\t")):
            selected ^= 1
        elif key in (curses.KEY_ENTER, ord("\n"), ord("\r")):
            return selected == 0
        elif key in (ord("q"), ord("Q"), 27):
            return False

# ---------------------------------------------------------------------------
#  STATUS BAR
# ---------------------------------------------------------------------------
def draw_status_bar(win, msg: str, color: int):
    h, w = win.getmaxyx()
    safe_addstr(win, h - 2, 0, " " * (w - 1), curses.color_pair(color))
    safe_addstr(win, h - 2, 0, f"  {msg}"[:w - 2], curses.color_pair(color) | curses.A_BOLD)
    hint = " UP/DOWN Navigate  Enter Select  Q Quit "
    safe_addstr(win, h - 1, max(0, w - len(hint) - 1), hint, curses.color_pair(P_DIM))

# ---------------------------------------------------------------------------
#  MAIN LOOP
# ---------------------------------------------------------------------------
def main(stdscr):
    init_colors()
    curses.curs_set(0)
    stdscr.nodelay(True)
    stdscr.keypad(True)

    selected   = 0
    status_msg = "Welcome to DigiPET Launcher  --  use UP/DOWN and Enter"
    status_col = P_ACCENT

    while True:
        stdscr.erase()
        h, w = stdscr.getmaxyx()

        draw_border(stdscr)
        content_y = draw_banner(stdscr, 1)
        draw_hline(stdscr, content_y, P_BORDER)
        draw_menu(stdscr, MENU_ITEMS, selected, content_y + 1)
        draw_hline(stdscr, h - 3, P_BORDER)
        draw_status_bar(stdscr, status_msg, status_col)
        stdscr.refresh()

        key = stdscr.getch()
        if key == -1:
            time.sleep(0.03)
            continue

        if key in (curses.KEY_UP, ord("k")):
            selected   = (selected - 1) % len(MENU_ITEMS)
            status_msg = MENU_ITEMS[selected][2]
            status_col = P_ACCENT

        elif key in (curses.KEY_DOWN, ord("j")):
            selected   = (selected + 1) % len(MENU_ITEMS)
            status_msg = MENU_ITEMS[selected][2]
            status_col = P_ACCENT

        elif key in (curses.KEY_ENTER, ord("\n"), ord("\r")):
            action, label, _ = MENU_ITEMS[selected]

            if action == Action.QUIT:
                break

            if action == Action.DEEP:
                stdscr.nodelay(False)
                ok = confirm_dialog(
                    stdscr,
                    "Deep Clean will DELETE node_modules and Cargo caches. "
                    "You will need to re-run Install Dependencies afterwards. Continue?"
                )
                stdscr.nodelay(True)
                if not ok:
                    status_msg = "Deep Clean cancelled."
                    status_col = P_WARN
                    continue

            if action == Action.RUN:
                # Run preflight check first (non-interactive task)
                stdscr.nodelay(False)
                run_task_screen(stdscr, action, label.strip())
                stdscr.nodelay(True)
                # Now hand off to shell
                curses.endwin()
                print("\n[DigiPET] Starting Tauri dev server -- press Ctrl+C to stop\n")
                os.system("npm run tauri dev")
                print("\n[DigiPET] Dev server stopped. Press Enter to return to launcher...")
                try:
                    input()
                except (EOFError, KeyboardInterrupt):
                    pass
                # Reinit curses
                stdscr = curses.initscr()
                init_colors()
                curses.curs_set(0)
                stdscr.keypad(True)
                stdscr.nodelay(True)
                status_msg = "Dev server exited"
                status_col = P_OK
            else:
                stdscr.nodelay(False)
                run_task_screen(stdscr, action, label.strip())
                stdscr.nodelay(True)
                status_msg = f"[OK] {label.strip()} finished"
                status_col = P_OK

        elif key in (ord("q"), ord("Q"), 27):
            break

        # Number shortcuts 1-7
        for i in range(len(MENU_ITEMS)):
            if key == ord(str(i + 1)):
                selected = i

# ---------------------------------------------------------------------------
#  ENTRY POINT
# ---------------------------------------------------------------------------
def entry():
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        try:
            curses.endwin()
        except Exception:
            pass
        print(f"\n[DigiPET] Fatal error: {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        try:
            curses.endwin()
        except Exception:
            pass
        print("\n[ DigiPET Launcher ] Goodbye!\n")


if __name__ == "__main__":
    entry()
