@echo off
setlocal enabledelayedexpansion

title Compilando DigiPET...
color 0B

echo ==================================================
echo        Construyendo App Portable DigiPET
echo ==================================================
echo.

:: 1. Instalar o actualizar dependencias por si acaso
echo [*] Preparando entorno y dependencias...
call npm install

:: 2. Compilar el proyecto completo usando Tauri
echo.
echo [*] Iniciando el proceso de compilacion (esto puede tardar varios minutos)...
call npm run tauri build

:: 3. Verificar si la compilacion fue exitosa
if not exist "src-tauri\target\release\DigiPET.exe" (
    echo.
    color 0C
    echo [ERROR] No se genero el archivo ejecutable. Revisa los errores arriba.
    pause
    exit /b 1
)

:: 4. Crear carpeta especial de salida
echo.
echo [*] Compilacion exitosa. Creando carpeta 'DigiPET_Portable'...
if exist "DigiPET_Portable" (
    rmdir /s /q "DigiPET_Portable"
)
mkdir "DigiPET_Portable"

:: 5. Mover el ejecutable portable
echo [*] Guardando el ejecutable principal...
move /y "src-tauri\target\release\DigiPET.exe" "DigiPET_Portable\DigiPET.exe" > nul

:: 6. Borrar el resto / Archivos residuales
echo [*] Eliminando todos los restos para ahorrar espacio y empaquetar de forma limpia...
rmdir /s /q "src-tauri\target"
rmdir /s /q "dist"

echo.
color 0A
echo ==================================================
echo [EXITO] ¡Todo listo!
echo.
echo Se ha generado un unico archivo portable con todo 
echo tu proyecto integrado. Cuando des doble clic sobre 
echo el se abrira automaticamente la aplicacion.
echo.
echo Ubicacion: DigiPET_Portable\DigiPET.exe
echo ==================================================
echo.
pause
