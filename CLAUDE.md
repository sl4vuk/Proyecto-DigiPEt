# CLAUDE.md

## Propósito

Este documento describe la arquitectura objetivo y las convenciones del proyecto DigiPET, una aplicación desktop de seguridad, monitoreo local y gestión segura de archivos construida sobre Tauri 2.

Debe usarse como guía para mantener el proyecto coherente con su estructura actual: frontend en `src/`, backend seguro en `src-tauri/`, scripts auxiliares en `scripts/` y script principal en `digipet.py`.

---

## Principios

- Core sensible en Rust, UI en React.
- Nada de secretos embebidos.
- Configuración persistente mínima en claro.
- Datos operativos sensibles en bóveda cifrada.
- UI premium, sobria, enterprise y fácil de demostrar.
- Módulos desacoplados para permitir evolución sin deuda estructural.
- La raíz del proyecto debe mantenerse limpia.
- `digipet.py` es el punto de entrada principal para automatización local.
- `scripts/` contiene utilidades secundarias, no lógica crítica de seguridad.

---

## Estructura del repositorio

```text
Proyecto DigiPEt
├── .agent/                  # Configuración local de agentes
├── .agents/                 # Configuración adicional de agentes
├── .codex/                  # Configuración para flujos con Codex
├── dist/                    # Build generado
├── logs/                    # Logs locales
├── public/                  # Assets públicos
├── scripts/                 # Scripts auxiliares
├── src/                     # Frontend React + TypeScript
├── src-tauri/               # Backend Tauri/Rust
├── digipet.py               # Script principal del proyecto
├── package.json             # Scripts y dependencias Node
├── Dockerfile               # Imagen Docker opcional
└── docker-compose.yml       # Orquestación Docker opcional
```

---

## Separación de responsabilidades

### Frontend (`src/`)

Responsable de:

- navegación
- interacción
- presentación visual
- experiencia de usuario
- estados de carga y error
- formularios
- composición de pantallas
- consumo de comandos Tauri

El frontend no debe implementar cifrado real, validación sensible de credenciales ni reglas de seguridad críticas.

### Backend Tauri (`src-tauri/`)

Responsable de:

- cifrado y descifrado del contenedor
- hashing y verificación de PIN
- derivación de claves
- persistencia segura
- auditoría local
- integridad de archivos y carpetas
- exportación de eventos
- bloqueo de sesión
- respuesta de emergencia
- comandos IPC expuestos al frontend

### Scripts (`digipet.py` y `scripts/`)

Responsables de:

- arranque del entorno local
- diagnóstico de dependencias
- limpieza de artefactos
- ejecución de tareas de desarrollo
- automatización auxiliar
- soporte a Docker cuando aplique

Reglas:

- `digipet.py` debe ser el único script principal en la raíz.
- Los scripts secundarios deben vivir en `scripts/`.
- Los scripts no deben duplicar lógica sensible del backend Rust.
- Los logs generados por scripts deben ir a `logs/`.

### Módulo visual

Responsable de:

- preview de webcam
- verificación de disponibilidad
- calibración inicial
- generación de eventos visuales
- futura integración de biometría o gestos

El módulo visual debe mantenerse desacoplado del core criptográfico.

---

## Modelo de persistencia

### `state.json`

Metadatos mínimos de control:

- inicialización
- hash de PIN
- salt de derivación
- intentos fallidos
- lockout temporal
- eventos previos al desbloqueo

### `vault.secure.json`

Contenedor cifrado con:

- activos protegidos
- eventos
- ajustes
- última ejecución de integridad

Regla general: lo sensible va cifrado; lo mínimo indispensable puede vivir como metadato de control.

---

## Convenciones

- Las mutaciones del backend devuelven el estado hidratado listo para pintar.
- Los eventos más recientes van primero.
- Toda falla importante debe incluir contexto del módulo.
- Las vistas deben incluir estados vacíos y feedback claro.
- El tema debe funcionar en claro, oscuro y sistema.
- Los cambios de ajustes deben persistirse automáticamente.
- No se deben mostrar botones de guardado para preferencias auto-guardadas.
- Las rutas de documentación deben coincidir con la estructura real del proyecto.
- No documentar scripts antiguos en la raíz si ahora pertenecen a `scripts/` o fueron reemplazados por `digipet.py`.

---

## Comandos de trabajo

Flujo recomendado:

```bash
python digipet.py
```

Alternativas directas:

```bash
npm install
npm run tauri dev
npm run tauri build
```

Validaciones recomendadas, si existen en `package.json`:

```bash
npm run lint
npm run typecheck
npm run build
```

No inventar scripts. Si un comando no existe, usar el flujo disponible en `digipet.py` o actualizar `package.json` antes de documentarlo como oficial.

---

## Docker

Docker es opcional y debe usarse para flujos auxiliares, aislamiento o automatización cuando tenga sentido.

Archivos relacionados:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`

Comando base:

```bash
docker compose up --build
```

Docker no sustituye el flujo nativo de Tauri para desarrollo desktop en Windows.

---

## Evolución sugerida

1. Integrar watchers del sistema de archivos.
2. Añadir aceptación de cambios de integridad.
3. Conectar pipeline biométrico real.
4. Añadir firma binaria y actualización segura.
5. Incorporar pruebas de integración y E2E.
6. Mantener `digipet.py` como panel principal de tareas.
7. Mover o consolidar scripts antiguos dentro de `scripts/`.
