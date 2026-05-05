import subprocess, shutil, sys, os, glob

APP_NAME = "DigiPET"
OUT_DIR = "DigiPET_Portable"
TAURI_DIR = "src-tauri/target/release"

def check(cmd):
    return shutil.which(cmd) is not None

def run(cmd):
    return subprocess.run(cmd, shell=True).returncode == 0

print("[START] build")

for cmd in ["node", "npm"]:
    if check(cmd):
        print(f"[OK] {cmd}")
    else:
        print(f"[NO] {cmd}")
        sys.exit(1)

if not os.path.exists("node_modules"):
    print("[NO] node_modules")
    sys.exit(1)
else:
    print("[OK] node_modules")

if not run("npm exec -- tauri -V"):
    print("[NO] tauri_cli")
    sys.exit(1)
else:
    print("[OK] tauri_cli")

print("[RUN] build")
if not run("npm exec -- tauri build"):
    print("[ERR] build_fail")
    sys.exit(1)

exe_files = glob.glob(f"{TAURI_DIR}/*.exe")

if not exe_files:
    print("[ERR] exe_not_found")
    sys.exit(1)

exe_path = exe_files[0]

if os.path.exists(OUT_DIR):
    shutil.rmtree(OUT_DIR)

os.makedirs(OUT_DIR, exist_ok=True)

shutil.copy(exe_path, f"{OUT_DIR}/{APP_NAME}.exe")

print(f"[OK] built -> {OUT_DIR}/{APP_NAME}.exe")