# DigiPET

## Resumen general

DigiPET es una aplicación de escritorio construida con Tauri 2, React, TypeScript y Rust. Su propósito es ofrecer una plataforma local para proteger archivos y carpetas, mantener una sesión segura con credencial maestra, auditar eventos sensibles y preparar un módulo visual desacoplado para futuras funciones biométricas o de vigilancia inteligente.

El proyecto combina una interfaz moderna con un núcleo seguro. La parte visual administra navegación, formularios, estados y experiencia de uso. La parte en Rust resuelve cifrado, persistencia, validación del PIN, sesiones en memoria, exportación de eventos y verificación de integridad.

La estructura actual también incorpora un script principal, `digipet.py`, una carpeta `scripts/` para automatizaciones auxiliares, soporte opcional con Docker y archivos de configuración para agentes y flujos asistidos.

---

## ¿De qué se trata?

DigiPET gira alrededor de una idea simple: un compañero digital con apariencia propia que vigila, protege y registra. No es solo una bóveda de archivos; es una estación local de protección y monitoreo pensada para escritorio.

El sistema puede inicializar un contenedor seguro, bloquear y desbloquear sesiones, registrar incidentes, exportar historial y servir como base para experiencias más narrativas o visuales centradas en una mascota digital.

---

## Objetivos del proyecto

1. Proteger archivos y carpetas mediante una bóveda local cifrada.
2. Mantener credenciales y claves fuera de texto plano.
3. Auditar eventos de seguridad de forma clara y exportable.
4. Detectar cambios de integridad sobre elementos protegidos.
5. Proveer un flujo de sesión local con bloqueo manual, automático y de emergencia.
6. Preparar una base técnica para un módulo visual con cámara, gestos o biometría.
7. Unificar la identidad del producto alrededor de DigiPET como personaje y plataforma.
8. Mantener una estructura de proyecto limpia, con `digipet.py` como entrada principal y `scripts/` para utilidades.

---

## Funciones principales

### 1. Inicialización segura

- Creación de PIN maestro.
- Generación de hash y salt local.
- Derivación de clave con Argon2id.
- Preparación del contenedor cifrado.

### 2. Bóveda local

- Persistencia de estado mínimo en `state.json`.
- Persistencia de datos sensibles cifrados en `vault.secure.json`.
- Carga y descarga segura de la sesión en memoria.

### 3. Gestión de activos

- Alta de archivos protegidos.
- Alta de carpetas protegidas.
- Bloqueo y desbloqueo lógico.
- Inventario de elementos con metadatos y estado.

### 4. Integridad y auditoría

- Escaneo de integridad.
- Registro de eventos recientes.
- Clasificación por severidad.
- Exportación a JSON para análisis o respaldo.

### 5. Configuración de seguridad

- Cambio de tema claro, oscuro o sistema.
- Auto-bloqueo por inactividad.
- Umbral de intentos fallidos.
- Modo de emergencia.
- Rotación del PIN maestro.

### 6. Módulo visual

- Comprobación de disponibilidad de webcam.
- Preview local de cámara.
- Calibración simulada.
- Generación de eventos visuales.
- Base preparada para biometría o gestos reales.

### 7. Automatización local

- Script principal `digipet.py`.
- Carpeta `scripts/` para tareas auxiliares.
- Carpeta `logs/` para registros locales.
- Soporte opcional mediante `Dockerfile` y `docker-compose.yml`.

---

## Arquitectura resumida

### Frontend (`src/`)

Responsable de:

- renderizado de la interfaz
- navegación y pantallas
- formularios y validaciones de entrada
- estados de carga y error
- toasts y feedback visual
- control de tema
- consumo de comandos Tauri

### Backend Tauri / Rust (`src-tauri/`)

Responsable de:

- cifrado y descifrado
- verificación del PIN
- persistencia segura
- manejo del runtime en memoria
- bloqueo y desbloqueo de sesión
- auditoría y exportación
- reglas de integridad
- respuesta de emergencia

### Scripts y soporte local

Responsable de:

- arranque del proyecto
- diagnóstico del entorno
- limpieza de artefactos
- tareas repetitivas de desarrollo
- registro de logs locales
- soporte opcional para Docker

---

## Estructura actual

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
├── digipet.py               # Script principal
├── package.json             # Dependencias y scripts Node
├── Dockerfile               # Docker opcional
└── docker-compose.yml       # Docker Compose opcional
```

---

## Identidad de la mascota DigiPET

La mascota de DigiPET es un ratón eléctrico rojo. Su diseño mezcla ternura digital con una presencia inquietante y vigilante. Tiene un cuerpo pequeño y ágil, con energía contenida, una silueta reconocible y una actitud de centinela. Sus ojos son negros y huecos, como cavidades oscuras sin pupilas, lo que le da una estética intensa, extraña y memorable.

No representa terror puro, sino vigilancia silenciosa. La idea es que DigiPET observe, registre y proteja. El color rojo comunica energía, alerta y actividad. Los ojos negros huecos comunican misterio, atención y una personalidad menos infantil y más simbólica.

En conjunto, la mascota puede funcionar como avatar del sistema, guía de interfaz, emblema visual del producto y eje narrativo para futuras funciones interactivas.

---

## Personalidad de marca

- Vigilante
- Eléctrico
- Minimalista
- Extraño pero carismático
- Protector
- Tecnológico
- Memorable

---

## Escenarios de uso

- Protección de documentos sensibles en un equipo local.
- Auditoría de eventos de seguridad en un entorno de escritorio.
- Monitoreo de cambios de integridad de archivos o carpetas.
- Base para demos con identidad visual fuerte y mascota propia.
- Plataforma inicial para funciones biométricas o de observación por cámara.
- Flujo local de desarrollo y demostración usando `digipet.py`.

---

## Estado actual del proyecto

Actualmente DigiPET ya incluye una base funcional completa para escritorio:

- arranque con Tauri 2
- frontend React operativo
- backend Rust organizado en `src-tauri/`
- permisos/capabilities de Tauri configurados
- flujos de bootstrap y sesión funcionando
- UI monocroma, minimalista y orientada a demo
- branding principal migrado a DigiPET
- script principal `digipet.py` en la raíz
- carpeta `scripts/` para utilidades auxiliares
- soporte opcional con Docker
- documentación principal separada en `README.md`, `CLAUDE.md`, `AGENTS.md` y `RESUME.md`

---

## Evolución sugerida

1. Reemplazar iconografía genérica por assets oficiales de DigiPET.
2. Diseñar pantalla de bienvenida centrada en la mascota.
3. Añadir narrativa visual del ratón eléctrico rojo en onboarding y alertas.
4. Integrar eventos reales de visión por computadora.
5. Añadir pruebas E2E y validación de persistencia en Windows.
6. Separar branding, lore y guía visual en documentación propia.
7. Consolidar automatizaciones en `digipet.py` y `scripts/`.
8. Mantener la raíz limpia y mover scripts auxiliares fuera de la raíz.

---

## Idea fuerza

DigiPET no es solo una app de seguridad. Es un compañero digital de vigilancia local: pequeño, eléctrico, rojo, de ojos negros huecos, diseñado para observar, proteger y dejar rastro de todo lo importante.
