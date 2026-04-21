@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "ROOT=%CD%"
set "LOG_DIR=%ROOT%\logs\terminal"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set "LAST_COMMAND="
set "LAST_LABEL="
set "LAST_LOG="

call :ensure_runtime_path

:menu
cls
echo ===============================================================
echo                   DIGIPET - DEV CONSOLE
echo ===============================================================
echo Proyecto: %ROOT%
echo Logs:     %LOG_DIR%
echo.
echo  1^) Instalar o reparar dependencias base
echo  2^) Ejecutar Tauri en modo desarrollo
echo  3^) Compilar build local
echo  4^) Limpiar artefactos generados
echo  5^) Buscar archivos huerfanos
echo  6^) Eliminar archivos huerfanos detectados
echo  7^) Reintentar ultimo comando
echo  8^) Diagnostico del entorno
echo  9^) Ver ultimo log
echo  0^) Salir
echo.
choice /c 1234567890 /n /m "Selecciona una opcion: "
set "OPT=%ERRORLEVEL%"

if "%OPT%"=="10" exit /b 0
if "%OPT%"=="9" goto view_log
if "%OPT%"=="8" goto diagnostics
if "%OPT%"=="7" goto retry
if "%OPT%"=="6" goto delete_orphans
if "%OPT%"=="5" goto scan_orphans
if "%OPT%"=="4" goto clean
if "%OPT%"=="3" goto build
if "%OPT%"=="2" goto dev
if "%OPT%"=="1" goto deps

goto menu

:deps
call "%ROOT%\dependencis.bat"
goto menu

:dev
call :run_logged "Tauri Dev" npm run tauri dev
goto menu

:build
call :run_logged "Tauri Build" npm run tauri build
goto menu

:clean
call :run_logged "Clean Generated Files" node scripts/clean.mjs
goto menu

:scan_orphans
call :run_logged "Orphan Scan" node scripts/orphans.mjs --report
goto menu

:delete_orphans
call :run_logged "Orphan Cleanup" node scripts/orphans.mjs --delete
goto menu

:retry
if not defined LAST_COMMAND (
  echo.
  echo [INFO] Aun no hay un comando previo para reintentar.
  pause
  goto menu
)
call :run_logged "%LAST_LABEL%" %LAST_COMMAND%
goto menu


:view_log
if not defined LAST_LOG (
  echo.
  echo [INFO] Aun no hay un log previo para mostrar.
  pause
  goto menu
)
echo.
echo [INFO] Ultimo log: %LAST_LOG%
powershell -NoProfile -Command "Get-Content -Path '%LAST_LOG%' -Tail 80"
echo.
pause
goto menu

:diagnostics
call :timestamp
set "CURRENT_LOG=%LOG_DIR%\diagnostics-!STAMP!.log"
(
  echo ===============================================================
  echo AEGIS VAULT DIAGNOSTICS
  echo Timestamp: %DATE% %TIME%
  echo Root:      %ROOT%
  echo ===============================================================
  echo.
  echo --- WHERE ---
  where node
  where npm
  where cargo
  where rustup
  echo.
  echo --- VERSIONS ---
  node --version
  npm --version
  cargo --version
  rustc --version
) > "!CURRENT_LOG!" 2>&1

type "!CURRENT_LOG!"
set "LAST_LABEL=Environment Diagnostics"
set "LAST_COMMAND=cmd /c type ""!CURRENT_LOG!"""
set "LAST_LOG=!CURRENT_LOG!"
pause
goto menu

:run_logged
set "LABEL=%~1"
shift
call :timestamp
set "SAFE_LABEL=%LABEL: =_%"
set "CURRENT_LOG=%LOG_DIR%\!STAMP!-!SAFE_LABEL!.log"
echo =============================================================== > "!CURRENT_LOG!"
echo LABEL: %LABEL% >> "!CURRENT_LOG!"
echo DATE : %DATE% %TIME% >> "!CURRENT_LOG!"
echo ROOT : %ROOT% >> "!CURRENT_LOG!"
echo =============================================================== >> "!CURRENT_LOG!"
echo. >> "!CURRENT_LOG!"

echo.
echo [RUN] %LABEL%
echo [LOG] !CURRENT_LOG!
echo.

call %* >> "!CURRENT_LOG!" 2>&1
set "RC=!ERRORLEVEL!"
set "LAST_LABEL=%LABEL%"
set "LAST_LOG=!CURRENT_LOG!"
set "LAST_COMMAND=%*"

if not "!RC!"=="0" (
  echo [ERROR] %LABEL% fallo con codigo !RC!
  echo [ERROR] Revisa este log: !CURRENT_LOG!
  echo.
  powershell -NoProfile -Command "Get-Content -Path '!CURRENT_LOG!' -Tail 40"
  echo.
  pause
  goto :eof
)

echo [OK] %LABEL% finalizado correctamente.
echo.
pause
goto :eof

:ensure_runtime_path
set "PATH=%ProgramFiles%\nodejs;%USERPROFILE%\.cargo\bin;%PATH%"
goto :eof

:timestamp
set "STAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "STAMP=%STAMP: =0%"
goto :eof
