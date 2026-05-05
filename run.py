import subprocess, shutil, sys, os

def check(cmd):
    return shutil.which(cmd) is not None

print("[START] run")

for cmd in ["node", "npm", "cargo"]:
    if check(cmd):
        print(f"[OK] {cmd}")
    else:
        print(f"[NO] {cmd}")
        sys.exit(1)

if not os.path.exists("package.json"):
    print("[ERR] package.json")
    sys.exit(1)

if not os.path.exists("node_modules"):
    print("[NO] node_modules -> ejecuta deps primero")
    sys.exit(1)
else:
    print("[OK] node_modules")

# Verifica Tauri CLI local
res = subprocess.run("npm exec -- tauri -V", shell=True)
if res.returncode != 0:
    print("[NO] tauri_cli")
    sys.exit(1)
else:
    print("[OK] tauri_cli")

print("[RUN] app")
subprocess.run("npm exec -- tauri dev", shell=True)