@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "ROOT=%CD%"
set "LOG_DIR=%ROOT%\logs\terminal"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

call :timestamp
if errorlevel 1 (
  echo [ERROR] No se pudo generar timestamp.
  pause
  exit /b 1
)

set "LOG_FILE=%LOG_DIR%\dependencies-%STAMP%.log"

(
  echo ===============================================================
  echo DIGIPET DEPENDENCY SETUP
  echo DATE: %DATE% %TIME%
  echo ROOT: %ROOT%
  echo ===============================================================
  echo.
) > "%LOG_FILE%"

call :ensure_runtime_path

echo [INFO] Instalando/verificando dependencias base...
echo [INFO] Log completo: %LOG_FILE%

call :require_command winget || goto :fail

call :exec "Node.js LTS" "winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements" || goto :fail
call :exec "Rustup" "winget install -e --id Rustlang.Rustup --accept-package-agreements --accept-source-agreements" || goto :fail

call :ensure_runtime_path

call :require_command rustup || goto :fail
call :exec "Rust toolchain stable MSVC" "rustup default stable-msvc" || goto :fail

call :exec "Visual Studio Build Tools" "winget install -e --id Microsoft.VisualStudio.2022.BuildTools --accept-package-agreements --accept-source-agreements --override ""--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended""" || goto :fail
call :exec "Microsoft Edge WebView2 Runtime" "winget install -e --id Microsoft.EdgeWebView2Runtime --accept-package-agreements --accept-source-agreements" || goto :fail

call :ensure_runtime_path
call :require_command npm || goto :fail

if not exist "%ROOT%\package.json" (
  echo [ERROR] No se encontro package.json en %ROOT%
  >> "%LOG_FILE%" echo [ERROR] No se encontro package.json en %ROOT%
  goto :fail
)

if not exist node_modules (
  call :exec "npm install" "npm install" || goto :fail
) else (
  echo [INFO] node_modules ya existe. Saltando npm install inicial.
  >> "%LOG_FILE%" echo [INFO] node_modules ya existe. Saltando npm install inicial.
)

call :exec "Frontend typecheck" "npm run typecheck" || goto :fail

echo.
echo [OK] Dependencias verificadas correctamente.
echo [OK] Puedes usar dev.bat o npm run tauri dev.
pause
exit /b 0

:fail
echo.
echo [ERROR] La configuracion de dependencias fallo.
echo [ERROR] Revisa el log: %LOG_FILE%
powershell -NoProfile -Command "Get-Content -Path '%LOG_FILE%' -Tail 80"
pause
exit /b 1

:exec
set "STEP=%~1"
set "COMMAND=%~2"

echo. >> "%LOG_FILE%"
echo =============================================================== >> "%LOG_FILE%"
echo STEP: %STEP% >> "%LOG_FILE%"
echo COMMAND: %COMMAND% >> "%LOG_FILE%"
echo =============================================================== >> "%LOG_FILE%"

echo [RUN] %STEP%
cmd /c "%COMMAND%" >> "%LOG_FILE%" 2>&1
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
  echo [ERROR] %STEP% fallo con codigo %RC%
  >> "%LOG_FILE%" echo [ERROR] %STEP% fallo con codigo %RC%
  exit /b %RC%
)

echo [OK] %STEP%
>> "%LOG_FILE%" echo [OK] %STEP%
exit /b 0

:require_command
where %1 >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se encontro el comando requerido: %1
  >> "%LOG_FILE%" echo [ERROR] No se encontro el comando requerido: %1
  exit /b 1
)
exit /b 0

:ensure_runtime_path
set "PATH=%ProgramFiles%\nodejs;%USERPROFILE%\.cargo\bin;%PATH%"
exit /b 0

:timestamp
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
if not defined STAMP exit /b 1
exit /b 0
