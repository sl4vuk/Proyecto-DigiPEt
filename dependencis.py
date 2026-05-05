import subprocess, shutil, sys

def run(cmd):
    return subprocess.run(cmd, shell=True).returncode == 0

def check(cmd):
    return shutil.which(cmd) is not None

print("[START] deps")

if not check("winget"):
    print("[ERR] winget")
    sys.exit(1)
print("[OK] winget")

if not check("node"):
    print("[RUN] install Node")
    run("winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements")
else:
    print("[OK] Node")

if not check("rustc"):
    print("[RUN] install Rust")
    run("winget install -e --id Rustlang.Rustup --accept-package-agreements --accept-source-agreements")
else:
    print("[OK] Rust")

if check("rustup"):
    run("rustup default stable-msvc")
    print("[OK] rust toolchain")
else:
    print("[ERR] rustup")
    sys.exit(1)

run("winget list -e --id Microsoft.VisualStudio.2022.BuildTools") or run(
    "winget install -e --id Microsoft.VisualStudio.2022.BuildTools --accept-package-agreements --accept-source-agreements --override \"--wait --passive --add Microsoft.VisualStudio.Workload.VCTools\""
)
print("[OK] buildtools")

run("winget list -e --id Microsoft.EdgeWebView2Runtime") or run(
    "winget install -e --id Microsoft.EdgeWebView2Runtime --accept-package-agreements --accept-source-agreements"
)
print("[OK] webview2")

print("[OK] deps_ready")