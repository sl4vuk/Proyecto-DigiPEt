# Aegis Vault

Aplicación de escritorio profesional para seguridad de archivos y carpetas, reconstruida con Tauri 2, React, TypeScript, Vite y Rust.

## Stack

- Tauri 2
- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- Zustand
- Framer Motion
- Lucide Icons
- Rust para el núcleo sensible

## Scripts principales

```bash
npm install
npm run tauri dev
npm run tauri build
```

### Batch files incluidos

- `dependencis.bat` - instala prerequisitos de Windows, Node LTS, Rustup, Build Tools y dependencias del proyecto.
- `dev.bat` - panel de control para desarrollo, diagnóstico, logs, limpieza y reintentos.
- `run.bat` - compila si hace falta y abre el ejecutable local.

## Arquitectura

```text
/src
  /app
  /components
  /features
  /hooks
  /layouts
  /lib
  /pages
  /services
  /store
  /styles
  /types

/src-tauri
  /capabilities
  /icons
  /src
    app_state.rs
    commands.rs
    error.rs
    integrity.rs
    models.rs
    security.rs
    storage.rs
```

## Núcleo de seguridad

- Bóveda local cifrada con AES-256-GCM
- Clave derivada desde el PIN con Argon2id
- Hash seguro de credencial maestra
- Sesión en memoria, desmontada al bloquear
- Inventario de activos protegidos con integridad local
- Bloqueo y desbloqueo lógico de elementos mediante atributos de solo lectura
- Registro de eventos de seguridad exportable a JSON
- Política de auto bloqueo y umbral de intentos fallidos
- Módulo de cámara desacoplado y preparado para integrar inferencia real

## Flujo de demo recomendado

1. Ejecuta `dependencis.bat`
2. Ejecuta `dev.bat`
3. Elige la opción de desarrollo
4. Crea el PIN maestro
5. Agrega archivos o carpetas
6. Ejecuta escaneo de integridad
7. Abre incidentes y exporta los logs

## Notas

- La base está lista para crecimiento real y empaquetado.
- El módulo visual está preparado para integrar MediaPipe, OpenCV o un motor biométrico serio sin reescribir el core.
- No hay secretos hardcodeados.
