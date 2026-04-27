@echo off
echo ============================
echo Limpiando proyecto...
echo ============================

REM Eliminar carpeta dist / build frontend
if exist dist (
    echo Eliminando dist...
    rmdir /s /q dist
)

if exist build (
    echo Eliminando build...
    rmdir /s /q build
)

REM Limpiar carpeta de Tauri build
if exist src-tauri\target (
    echo Eliminando target de Tauri...
    rmdir /s /q src-tauri\target
)

REM Limpiar cache de Vite (si existe)
if exist node_modules\.vite (
    echo Limpiando cache de Vite...
    rmdir /s /q node_modules\.vite
)

echo ============================
echo Instalando dependencias (opcional)...
echo ============================
REM npm install

echo ============================
echo Construyendo frontend...
echo ============================
npm run build

echo ============================
echo Ejecutando Tauri...
echo ============================
npm run tauri dev


pause