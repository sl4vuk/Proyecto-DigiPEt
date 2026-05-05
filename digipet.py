#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DigiPET - Smart TUI Launcher v3.2
Clean terminal interface for the Tauri project.
"""

import curses
import glob
import io
import os
import platform
import shutil
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path


# -----------------------------------------------------------------------------
# Windows console setup
# -----------------------------------------------------------------------------
if sys.platform == "win32":
    try:
        import ctypes

        ctypes.windll.kernel32.SetConsoleOutputCP(65001)
        ctypes.windll.kernel32.SetConsoleCP(65001)
        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-11)
        mode = ctypes.c_ulong()
        if kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
            kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        pass

    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass


# -----------------------------------------------------------------------------
# Theme
# -----------------------------------------------------------------------------
P_NORMAL  = 1
P_DIM     = 2
P_REVERSE = 3
P_ACCENT  = 4
P_SUCCESS = 5
P_ERROR   = 6
P_WARN    = 7
P_BOX     = 8
P_LABEL   = 9


def init_theme() -> None:
    curses.start_color()
    try:
        curses.use_default_colors()
        bg = -1
    except Exception:
        bg = curses.COLOR_BLACK

    curses.init_pair(P_NORMAL,  curses.COLOR_WHITE,  bg)
    try:
        curses.init_pair(P_DIM, 8, bg)
    except Exception:
        curses.init_pair(P_DIM, curses.COLOR_WHITE, bg)
    curses.init_pair(P_REVERSE, curses.COLOR_BLACK, curses.COLOR_WHITE)
    curses.init_pair(P_ACCENT,  curses.COLOR_CYAN,   bg)
    curses.init_pair(P_SUCCESS, curses.COLOR_GREEN,  bg)
    curses.init_pair(P_ERROR,   curses.COLOR_RED,    bg)
    curses.init_pair(P_WARN,    curses.COLOR_YELLOW, bg)
    curses.init_pair(P_BOX,     curses.COLOR_CYAN,   bg)
    curses.init_pair(P_LABEL,   curses.COLOR_MAGENTA,bg)


def attr_normal(extra: int = 0)  -> int: return curses.color_pair(P_NORMAL)  | extra
def attr_dim(extra: int = 0)     -> int: return curses.color_pair(P_DIM)     | extra
def attr_reverse(extra: int = 0) -> int: return curses.color_pair(P_REVERSE) | extra
def attr_accent(extra: int = 0)  -> int: return curses.color_pair(P_ACCENT)  | extra
def attr_success(extra: int = 0) -> int: return curses.color_pair(P_SUCCESS) | extra
def attr_error(extra: int = 0)   -> int: return curses.color_pair(P_ERROR)   | extra
def attr_warn(extra: int = 0)    -> int: return curses.color_pair(P_WARN)    | extra
def attr_box(extra: int = 0)     -> int: return curses.color_pair(P_BOX)     | extra
def attr_label(extra: int = 0)   -> int: return curses.color_pair(P_LABEL)   | extra


# -----------------------------------------------------------------------------
# System info
# -----------------------------------------------------------------------------
def short_path(path: str, max_len: int = 76) -> str:
    if len(path) <= max_len:
        return path
    return "..." + path[-(max_len - 3):]


def get_system_info() -> dict[str, str]:
    try:
        host = socket.gethostname()
    except Exception:
        host = "unknown"

    user = os.environ.get("USERNAME") or os.environ.get("USER") or "unknown"

    try:
        os_name = f"{platform.system()} {platform.release()} {platform.machine()}"
    except Exception:
        os_name = "unknown"

    try:
        cwd = short_path(str(Path.cwd()))
    except Exception:
        cwd = "."

    try:
        py_version = f"Python {platform.python_version()}"
    except Exception:
        py_version = "Python unknown"

    return {
        "os":   os_name,
        "user": f"{user}@{host}",
        "dir":  cwd,
        "py":   py_version,
    }


SYS_INFO     = get_system_info()
VERSION      = "v3.2"
APP_SUBTITLE = f"TAURI PROJECT SMART LAUNCHER  {VERSION}"

# Banner — uses only block characters (safe on any UTF-8 terminal)
BANNER_LINES = [
    "██████  ██  ██████  ██ ██████  ███████ ████████",
    "██   ██ ██ ██       ██ ██   ██ ██         ██   ",
    "██   ██ ██ ██   ███ ██ ██████  █████      ██   ",
    "██   ██ ██ ██    ██ ██ ██      ██         ██   ",
    "██████  ██  ██████  ██ ██      ███████    ██   ",
]


# -----------------------------------------------------------------------------
# Actions and menu  (no numbers, no commands — only brief descriptions)
# -----------------------------------------------------------------------------
class Action:
    DEPS   = "deps"
    RUN    = "run"
    BUILD  = "build"
    UPDATE = "update"
    CLEAN  = "clean"
    DEEP   = "deep"
    DOCTOR = "doctor"
    QUIT   = "quit"


# (action, label, description)
MENU_ITEMS = [
    (Action.DEPS,   "Install Dependencies",  "Set up the full Windows toolchain and project packages"),
    (Action.RUN,    "Run Dev Mode",           "Launch the Tauri development server with hot-reload"),
    (Action.BUILD,  "Build Release",          "Compile a portable release executable"),
    (Action.UPDATE, "Update Packages",        "Refresh npm and Cargo dependency versions"),
    (Action.CLEAN,  "Smart Clean",            "Remove build artifacts, logs and temp files"),
    (Action.DEEP,   "Deep Clean",             "Wipe dependency caches — reinstall required after"),
    (Action.DOCTOR, "Environment Doctor",     "Verify all required tools are present and healthy"),
    (Action.QUIT,   "Exit",                   "Close the launcher"),
]

TASK_LABEL = {action: label for action, label, _desc in MENU_ITEMS}


# -----------------------------------------------------------------------------
# Shell helpers
# -----------------------------------------------------------------------------
def run_cmd(cmd: str) -> tuple[int, str]:
    proc = subprocess.run(
        cmd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return proc.returncode, (proc.stdout or "").strip()


def cmd_exists(name: str) -> bool:
    return shutil.which(name) is not None


def safe_remove(path: str | Path) -> None:
    p = Path(path)
    try:
        if p.is_file() or p.is_symlink():
            p.unlink()
        elif p.is_dir():
            shutil.rmtree(p, ignore_errors=True)
    except Exception:
        pass


# -----------------------------------------------------------------------------
# Safe drawing helpers
# -----------------------------------------------------------------------------
def safe_addstr(win, y: int, x: int, text: str, attr: int = 0) -> None:
    try:
        max_y, max_x = win.getmaxyx()
        if y < 0 or y >= max_y or x < 0 or x >= max_x:
            return
        available = max_x - x - 1
        if available <= 0:
            return
        win.addstr(y, x, str(text)[:available], attr)
    except Exception:
        pass


def hline(win, y: int, x: int, width: int, ch: str = "─", attr: int = 0) -> None:
    safe_addstr(win, y, x, ch * max(0, width), attr)


def draw_box(win, y: int, x: int, h: int, w: int, title: str = "") -> None:
    if h < 3 or w < 4:
        return
    attr = attr_box()
    safe_addstr(win, y,         x, "╔" + "═" * (w - 2) + "╗", attr)
    for row in range(1, h - 1):
        safe_addstr(win, y + row, x,         "║", attr)
        safe_addstr(win, y + row, x + w - 1, "║", attr)
    safe_addstr(win, y + h - 1, x, "╚" + "═" * (w - 2) + "╝", attr)
    if title:
        safe_addstr(win, y, x + 2, f" {title} ", attr_accent(curses.A_BOLD))


def center_text(win, y: int, text: str, attr: int = 0) -> None:
    _, w = win.getmaxyx()
    x = max(0, (w - len(text)) // 2)
    safe_addstr(win, y, x, text, attr)


# -----------------------------------------------------------------------------
# Log prefixes  (safe Unicode — no multi-codepoint sequences or emoji)
# -----------------------------------------------------------------------------
# Arrow alternatives that work on Windows consoles with UTF-8:
#   skip    ->  >>  (plain ASCII, always safe)
#   running ->  >>  (same, accent colored)
#   install ->  vv  (downward hint, plain ASCII)
#   remove  ->  ^^  (upward hint, plain ASCII)
# Checkmark / cross use the simplest forms.
PREFIX = {
    "ok":      "\u2713",   # ✓
    "error":   "\u2715",   # ✕
    "warn":    "!",
    "info":    "\u25cf",   # ●
    "skip":    ">>",
    "install": "vv",
    "remove":  "^^",
    "running": ">>",
}

SPINNER = ["\u280b", "\u2819", "\u2839", "\u2838", "\u283c",
           "\u2834", "\u2826", "\u2827", "\u2807", "\u280f"]


def attr_for_kind(kind: str) -> int:
    if kind == "ok":
        return attr_success(curses.A_BOLD)
    if kind == "error":
        return attr_error(curses.A_BOLD)
    if kind == "warn":
        return attr_warn(curses.A_BOLD)
    if kind == "skip":
        return attr_dim(curses.A_BOLD)
    if kind in ("install", "remove", "running"):
        return attr_accent(curses.A_BOLD)
    return attr_accent(curses.A_BOLD)


# -----------------------------------------------------------------------------
# Screens
# -----------------------------------------------------------------------------
def draw_header(win) -> int:
    _, width = win.getmaxyx()
    y = 1

    for line in BANNER_LINES:
        center_text(win, y, line, attr_accent(curses.A_BOLD))
        y += 1

    y += 1
    center_text(win, y, APP_SUBTITLE, attr_dim(curses.A_BOLD))
    y += 2

    box_w = min(88, max(48, width - 8))
    box_x = max(0, (width - box_w) // 2)
    draw_box(win, y, box_x, 6, box_w, "SYSTEM")
    fields = [
        ("OS",   SYS_INFO["os"]),
        ("USER", SYS_INFO["user"]),
        ("DIR",  SYS_INFO["dir"]),
        ("PY",   SYS_INFO["py"]),
    ]
    for idx, (key, value) in enumerate(fields):
        safe_addstr(win, y + 1 + idx, box_x + 3, f"{key:<5}", attr_accent(curses.A_BOLD))
        safe_addstr(win, y + 1 + idx, box_x + 8, ":", attr_dim())
        safe_addstr(win, y + 1 + idx, box_x + 10, value, attr_normal())

    return y + 7


def draw_menu(win, selected: int, top_y: int) -> None:
    height, width = win.getmaxyx()
    menu_w = min(100, max(68, width - 16))
    menu_h = len(MENU_ITEMS) + 6
    menu_x = max(0, (width - menu_w) // 2)
    draw_box(win, top_y, menu_x, menu_h, menu_w, "ACTIONS")

    # Column headers
    header_y = top_y + 2
    safe_addstr(win, header_y, menu_x + 5,  "ACTION",      attr_accent(curses.A_BOLD))
    safe_addstr(win, header_y, menu_x + 34, "DESCRIPTION", attr_accent(curses.A_BOLD))
    hline(win, header_y + 1, menu_x + 2, menu_w - 4, "─", attr_box())

    for idx, (_action, label, desc) in enumerate(MENU_ITEMS):
        row_y  = header_y + 2 + idx
        is_sel = idx == selected

        if is_sel:
            # Highlight entire row
            safe_addstr(win, row_y, menu_x + 1, " " * (menu_w - 2), attr_reverse(curses.A_BOLD))
            safe_addstr(win, row_y, menu_x + 3, "\u25b8",            attr_reverse(curses.A_BOLD))  # ▸
            safe_addstr(win, row_y, menu_x + 5, f"{label:<28}",      attr_reverse(curses.A_BOLD))
            safe_addstr(win, row_y, menu_x + 34, desc[:menu_w - 38], attr_reverse(curses.A_BOLD))
        else:
            safe_addstr(win, row_y, menu_x + 5,  f"{label:<28}", attr_normal())
            safe_addstr(win, row_y, menu_x + 34,  desc[:menu_w - 38], attr_dim())

    # Footer description of selected item
    desc_y = min(height - 3, top_y + menu_h + 1)
    safe_addstr(win, desc_y, 2, MENU_ITEMS[selected][2], attr_dim())


def draw_footer(win) -> None:
    height, width = win.getmaxyx()
    if height < 4:
        return
    hline(win, height - 2, 0, width - 1, "─", attr_box())
    hint = "UP/DOWN or K/J : navigate    ENTER : select    ESC/Q : exit"
    center_text(win, height - 1, hint[: width - 1], attr_dim())


def draw_main(stdscr, selected: int) -> None:
    stdscr.erase()
    height, width = stdscr.getmaxyx()
    if height < 22 or width < 76:
        safe_addstr(stdscr, 1, 2, "DigiPET Launcher", attr_normal(curses.A_BOLD))
        safe_addstr(stdscr, 3, 2, "Increase the terminal size for the full interface.", attr_dim())
        draw_footer(stdscr)
        stdscr.refresh()
        return

    top = draw_header(stdscr)
    draw_menu(stdscr, selected, top)
    draw_footer(stdscr)
    stdscr.refresh()


def draw_message_screen(stdscr, title: str, lines: list[str], pause: bool = True) -> None:
    stdscr.erase()
    height, width = stdscr.getmaxyx()
    box_w = min(88, max(50, width - 10))
    box_h = min(max(8, len(lines) + 5), height - 4)
    y = max(0, (height - box_h) // 2)
    x = max(0, (width - box_w) // 2)
    draw_box(stdscr, y, x, box_h, box_w, title)

    max_lines = box_h - 4
    for i, line in enumerate(lines[:max_lines]):
        safe_addstr(stdscr, y + 2 + i, x + 3, line[: box_w - 6], attr_normal())

    if pause:
        safe_addstr(stdscr, y + box_h - 2, x + 3, "Press any key to continue...", attr_dim())
    stdscr.refresh()
    if pause:
        stdscr.nodelay(False)
        stdscr.getch()
        stdscr.nodelay(True)


# -----------------------------------------------------------------------------
# Task screen
# -----------------------------------------------------------------------------
def run_task_screen(stdscr, action: str) -> None:
    label = TASK_LABEL.get(action, action)
    logs: list[tuple[str, str]] = []
    done = False

    def worker() -> None:
        nonlocal done
        try:
            for item in TASKS[action]():
                logs.append(item)
        except Exception as exc:
            logs.append(("error", f"Task crashed: {exc}"))
        finally:
            done = True

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()

    while True:
        stdscr.erase()
        height, width = stdscr.getmaxyx()
        title  = f"TASK  {label}"
        box_w  = max(60, width - 6)
        box_h  = max(10, height - 4)
        draw_box(stdscr, 1, 3, box_h, box_w, title)

        log_y       = 3
        max_visible = box_h - 6
        visible     = logs[-max_visible:]
        for i, (kind, message) in enumerate(visible):
            visual_kind = kind
            lower_msg   = message.lower()
            if kind == "info" and "install" in lower_msg:
                visual_kind = "install"
            elif kind == "info" and ("running" in lower_msg or "starting" in lower_msg):
                visual_kind = "running"
            elif kind == "info" and ("removing" in lower_msg or "clean" in lower_msg):
                visual_kind = "remove"
            prefix = PREFIX.get(visual_kind, "\u25cf")
            safe_addstr(stdscr, log_y + i, 6,  prefix,              attr_for_kind(visual_kind))
            safe_addstr(stdscr, log_y + i, 10, message[: width - 14], attr_normal())

        status_y = min(height - 3, 1 + box_h - 2)
        if done:
            safe_addstr(stdscr, status_y, 6,
                        "\u2713 Finished. Press any key to return.",
                        attr_success(curses.A_BOLD))
        else:
            spin = SPINNER[int(time.time() * 10) % len(SPINNER)]
            safe_addstr(stdscr, status_y, 6,
                        f"{spin}  Running. Please wait...",
                        attr_accent(curses.A_BOLD))

        stdscr.refresh()

        if done:
            thread.join(timeout=0.1)
            stdscr.nodelay(False)
            stdscr.getch()
            stdscr.nodelay(True)
            return

        time.sleep(0.12)


# -----------------------------------------------------------------------------
# Confirm dialog
# -----------------------------------------------------------------------------
def confirm_dialog(stdscr, title: str, message: str) -> bool:
    selected = 0
    buttons  = ["Continue", "Cancel"]

    while True:
        stdscr.erase()
        height, width = stdscr.getmaxyx()
        box_w = min(76, max(52, width - 10))
        box_h = 10
        y = max(0, (height - box_h) // 2)
        x = max(0, (width  - box_w) // 2)
        draw_box(stdscr, y, x, box_h, box_w, title)

        words: list[str] = message.split()
        lines: list[str] = []
        current = ""
        for word in words:
            if len(current) + len(word) + 1 > box_w - 8:
                lines.append(current)
                current = word
            else:
                current = (current + " " + word).strip()
        if current:
            lines.append(current)

        for i, line in enumerate(lines[:4]):
            safe_addstr(stdscr, y + 2 + i, x + 4, line, attr_normal())

        btn_y    = y + box_h - 3
        first_x  = x + 10
        second_x = x + 28
        for i, button in enumerate(buttons):
            bx   = first_x if i == 0 else second_x
            text = f"  {button}  "
            if selected == i:
                safe_addstr(stdscr, btn_y, bx, text, attr_reverse(curses.A_BOLD))
            else:
                safe_addstr(stdscr, btn_y, bx, text, attr_normal())

        safe_addstr(stdscr, y + box_h - 1, x + 4,
                    "LEFT/RIGHT: choose    ENTER: confirm    ESC/Q: cancel",
                    attr_dim())
        stdscr.refresh()

        key = stdscr.getch()
        if key in (curses.KEY_LEFT, curses.KEY_RIGHT, ord("\t")):
            selected = 1 - selected
        elif key in (curses.KEY_ENTER, ord("\n"), ord("\r")):
            return selected == 0
        elif key in (27, ord("q"), ord("Q")):
            return False


# -----------------------------------------------------------------------------
# Task generators
# -----------------------------------------------------------------------------
def task_deps():
    yield ("info", "Checking winget")
    if not cmd_exists("winget"):
        yield ("error", "winget not found. Windows 10/11 with App Installer is required")
        return

    yield ("ok", "winget found")

    for bin_name, package_id in [("node", "OpenJS.NodeJS.LTS"), ("rustc", "Rustlang.Rustup")]:
        if cmd_exists(bin_name):
            yield ("skip", f"{bin_name} already installed")
        else:
            yield ("info", f"Installing {package_id}")
            rc, out = run_cmd(
                f"winget install -e --id {package_id} --accept-package-agreements --accept-source-agreements"
            )
            if rc == 0:
                yield ("ok", f"{package_id} installed")
            else:
                yield ("warn", f"{package_id} may need manual install: {out[:180]}")

    if cmd_exists("rustup"):
        yield ("info", "Setting Rust toolchain to stable-msvc")
        run_cmd("rustup default stable-msvc")
        yield ("ok", "Rust toolchain ready")
    else:
        yield ("error", "rustup not found. Restart terminal and retry")
        return

    yield ("info", "Checking Visual Studio Build Tools")
    rc, _ = run_cmd("winget list -e --id Microsoft.VisualStudio.2022.BuildTools")
    if rc != 0:
        yield ("info", "Installing Visual Studio Build Tools. This can take several minutes")
        run_cmd(
            'winget install -e --id Microsoft.VisualStudio.2022.BuildTools '
            '--accept-package-agreements --accept-source-agreements '
            '--override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools"'
        )
    yield ("ok", "Visual Studio Build Tools ready")

    yield ("info", "Checking WebView2 Runtime")
    rc, _ = run_cmd("winget list -e --id Microsoft.EdgeWebView2Runtime")
    if rc != 0:
        run_cmd(
            "winget install -e --id Microsoft.EdgeWebView2Runtime "
            "--accept-package-agreements --accept-source-agreements"
        )
    yield ("ok", "WebView2 Runtime ready")

    if not Path("node_modules").exists():
        yield ("info", "Running npm install")
        rc, out = run_cmd("npm install")
        if rc == 0:
            yield ("ok", "npm install complete")
        else:
            yield ("error", f"npm install failed: {out[:300]}")
            return
    else:
        yield ("skip", "node_modules already present")

    yield ("ok", "All dependencies are ready")


def task_run():
    yield ("info", "Verifying environment")
    for tool in ("node", "npm", "cargo"):
        if cmd_exists(tool):
            yield ("ok", f"{tool} found")
        else:
            yield ("error", f"{tool} not found. Run Install Dependencies first")
            return

    if not Path("package.json").exists():
        yield ("error", "package.json missing. Run from the project root")
        return
    if not Path("node_modules").exists():
        yield ("warn", "node_modules missing. Run Install Dependencies first")
        return

    yield ("ok", "Environment ready")
    yield ("info", "The Tauri dev server will start after this check")


def smart_clean_generator():
    removed = 0
    patterns = [
        "src-tauri/target/release/build",
        "src-tauri/target/release/deps",
        "src-tauri/target/release/incremental",
        "src-tauri/target/debug",
        "dist",
        ".vite",
        "*.log",
        "**/*.log",
        ".DS_Store",
        "**/.DS_Store",
        "Thumbs.db",
        "**/Thumbs.db",
        ".env.local",
        "__pycache__",
        "**/__pycache__",
        "*.pyc",
        "**/*.pyc",
    ]

    for pattern in patterns:
        for match in glob.glob(pattern, recursive=True):
            safe_remove(match)
            removed += 1
            yield ("ok", f"Removed {match}")

    for item in Path(".").iterdir():
        if item.is_file() and item.stat().st_size == 0 and item.suffix not in (".ts", ".js", ".json", ".toml"):
            try:
                item.unlink()
                removed += 1
                yield ("ok", f"Removed empty {item}")
            except Exception:
                pass

    yield ("ok", f"Smart clean done. {removed} items removed")


def task_clean():
    yield ("info", "Running smart clean")
    yield from smart_clean_generator()


def task_build():
    yield ("info", "Pre-build smart clean")
    yield from smart_clean_generator()

    yield ("info", "Starting Tauri release build")
    rc, out = run_cmd("npm exec -- tauri build")
    if rc != 0:
        for line in out.splitlines()[-25:]:
            yield ("error", line)
        yield ("error", "Build failed. See output above")
        return

    exe_files = glob.glob("src-tauri/target/release/*.exe")
    if not exe_files:
        yield ("error", "No .exe found in src-tauri/target/release")
        return

    out_dir = Path("DigiPET_Portable")
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir()

    dest    = out_dir / "DigiPET.exe"
    shutil.copy(exe_files[0], dest)
    size_mb = dest.stat().st_size / 1_048_576
    yield ("ok", f"Executable: {dest} ({size_mb:.1f} MB)")
    yield ("ok", "Build complete")


def task_update():
    yield ("info", "Updating npm packages")
    if not Path("package.json").exists():
        yield ("warn", "package.json not found. Skipping npm update")
    else:
        rc, out = run_cmd("npm update")
        if rc == 0:
            yield ("ok", "npm packages updated")
        else:
            yield ("warn", f"npm update reported issues: {out[:200]}")

        yield ("info", "Running npm audit fix")
        rc, _ = run_cmd("npm audit fix")
        if rc == 0:
            yield ("ok", "npm audit fix complete")
        else:
            yield ("warn", "npm audit fix had warnings. Check manually")

    if cmd_exists("cargo"):
        if cmd_exists("rustup"):
            yield ("info", "Updating Rust toolchain")
            rc, out = run_cmd("rustup update")
            if rc == 0:
                yield ("ok", "Rust toolchain updated")
            else:
                yield ("warn", f"rustup update reported issues: {out[:120]}")

        if Path("src-tauri/Cargo.toml").exists():
            yield ("info", "Updating Cargo dependencies")
            rc, out = run_cmd("cargo update --manifest-path src-tauri/Cargo.toml")
            if rc == 0:
                yield ("ok", "Cargo dependencies updated")
            else:
                yield ("warn", f"cargo update reported issues: {out[:120]}")
        else:
            yield ("skip", "src-tauri/Cargo.toml not found. Skipping Cargo update")
    else:
        yield ("skip", "cargo not found. Skipping Rust updates")

    yield ("ok", "Package update finished")


def task_deep_clean():
    yield ("warn", "Deep clean removes node_modules and Cargo caches")
    yield from smart_clean_generator()

    targets = [
        "node_modules",
        "src-tauri/target",
        str(Path.home() / ".cargo" / "registry" / "cache"),
    ]
    for target in targets:
        path = Path(target)
        if path.exists():
            yield ("info", f"Removing {path}")
            shutil.rmtree(path, ignore_errors=True)
            yield ("ok", f"Removed {path}")
        else:
            yield ("skip", f"Not found: {path}")

    yield ("ok", "Deep clean complete. Run Install Dependencies before next use")


def task_doctor():
    yield ("info", "Environment Doctor")
    checks = [
        ("node",   "Node.js", "node --version"),
        ("npm",    "npm",     "npm --version"),
        ("rustc",  "Rust",    "rustc --version"),
        ("cargo",  "Cargo",   "cargo --version"),
        ("rustup", "Rustup",  "rustup --version"),
        ("git",    "Git",     "git --version"),
        ("winget", "Winget",  "winget --version"),
    ]

    for binary, label, command in checks:
        if cmd_exists(binary):
            _, version = run_cmd(command)
            first_line = version.splitlines()[0] if version else "found"
            yield ("ok", f"{label:<18} {first_line[:60]}")
        else:
            yield ("error", f"{label:<18} NOT FOUND")

    yield ("info", "Checking project structure")
    for file_path in ["package.json", "src-tauri/tauri.conf.json", "src-tauri/Cargo.toml"]:
        if Path(file_path).exists():
            yield ("ok",   f"found   {file_path}")
        else:
            yield ("warn", f"missing {file_path}")

    if Path("node_modules").exists():
        yield ("ok",   "node_modules present")
    else:
        yield ("warn", "node_modules missing")

    rc, version = run_cmd("npm exec -- tauri -V")
    if rc == 0:
        yield ("ok",   f"Tauri CLI {version.strip()}")
    else:
        yield ("warn", "Tauri CLI not available. Install dependencies first")

    yield ("ok", "Doctor check complete")


TASKS = {
    Action.DEPS:   task_deps,
    Action.RUN:    task_run,
    Action.BUILD:  task_build,
    Action.UPDATE: task_update,
    Action.CLEAN:  task_clean,
    Action.DEEP:   task_deep_clean,
    Action.DOCTOR: task_doctor,
}


# -----------------------------------------------------------------------------
# Main loop
# -----------------------------------------------------------------------------
def handle_action(stdscr, action: str) -> bool:
    if action == Action.QUIT:
        return False

    if action in (Action.DEEP, Action.UPDATE):
        if action == Action.DEEP:
            message = "Deep Clean will delete node_modules and Cargo caches. You will need to reinstall dependencies afterwards."
        else:
            message = "This will update npm and Cargo dependencies. Some versions may change."
        if not confirm_dialog(stdscr, "CONFIRM ACTION", message):
            return True

    if action == Action.RUN:
        run_task_screen(stdscr, action)
        curses.endwin()
        print("\n  >> Starting Tauri dev server. Press Ctrl+C to stop.\n")
        try:
            os.system("npm run tauri dev")
        finally:
            print("\n  -- Dev server stopped. Press Enter to return...")
            try:
                input()
            except (EOFError, KeyboardInterrupt):
                pass
            stdscr = curses.initscr()
            init_theme()
            curses.curs_set(0)
            stdscr.keypad(True)
            stdscr.nodelay(True)
        return True

    run_task_screen(stdscr, action)
    return True


def main(stdscr) -> None:
    init_theme()
    curses.curs_set(0)
    stdscr.keypad(True)
    stdscr.nodelay(True)

    selected = 0

    while True:
        draw_main(stdscr, selected)
        key = stdscr.getch()
        if key == -1:
            time.sleep(0.04)
            continue

        if key in (curses.KEY_UP, ord("k"), ord("K")):
            selected = (selected - 1) % len(MENU_ITEMS)
        elif key in (curses.KEY_DOWN, ord("j"), ord("J")):
            selected = (selected + 1) % len(MENU_ITEMS)
        elif key in (curses.KEY_ENTER, ord("\n"), ord("\r")):
            action = MENU_ITEMS[selected][0]
            if not handle_action(stdscr, action):
                break
        elif key in (27, ord("q"), ord("Q")):
            break


# -----------------------------------------------------------------------------
# Entry point
# -----------------------------------------------------------------------------
def entry() -> None:
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        try:
            curses.endwin()
        except Exception:
            pass
        print(f"\n \u2715 DigiPET fatal error: {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        try:
            curses.endwin()
        except Exception:
            pass
        print("\n  [ DigiPET Launcher ] Goodbye.\n")


if __name__ == "__main__":
    entry()
