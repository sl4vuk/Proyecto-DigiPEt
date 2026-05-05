# ⚡ DigiPET

<p align="center">
  <a href="https://github.com/sl4vuk/Proyecto-DigiPEt" target="_blank">
    <img src="https://github.com/sl4vuk/Proyecto-DigiPEt/blob/main/public/d3538367-1c42-42cc-a8f1-cd365bc9c9d9.png?raw=true" alt="DigiPET">
  </a>
</p>

[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge&logo=github&color=%230567ff)](https://github.com/sl4vuk/Proyecto-DigiPEt/releases/latest)
[![Platform](https://img.shields.io/badge/platform-Windows-informational?style=for-the-badge&logo=windows&color=%230078d4)](https://github.com/sl4vuk/Proyecto-DigiPEt)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-blueviolet?style=for-the-badge&logo=tauri)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-Secure%20Core-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Web Oficial](https://img.shields.io/badge/Web-Oficial-blue?style=for-the-badge&logo=wechat&logoColor=white)](https://digipet-sentinel.lovable.app)

> DigiPET es una aplicación de escritorio para protección local de archivos, monitoreo seguro, auditoría e integridad, construida con **Tauri 2**, **React 19**, **TypeScript**, **Vite** y un núcleo seguro en **Rust**.

---

## 📦 Stack Tecnológico

| Tecnología | Rol |
|---|---|
| Tauri 2 | Shell nativo de escritorio |
| React 19 | Interfaz de usuario |
| TypeScript | Tipado estático |
| Vite | Bundler y servidor de desarrollo |
| Tailwind CSS | Sistema de estilos |
| Zustand | Gestión de estado |
| Framer Motion | Animaciones sutiles |
| Lucide Icons | Iconografía |
| Rust | Núcleo criptográfico y operaciones sensibles |
| Python | Script principal de arranque y automatización local |
| Docker | Entorno opcional de ejecución/aislamiento |

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias del proyecto

```bash
npm install
```

### 2. Usar el script principal del proyecto

```bash
python digipet.py
```

`digipet.py` es el punto de entrada recomendado para trabajar con el proyecto. Centraliza tareas de desarrollo, ejecución, diagnóstico, limpieza y automatización local.

### 3. Ejecutar Tauri manualmente

```bash
npm run tauri dev
```

### 4. Compilar la aplicación

```bash
npm run tauri build
```

> [!TIP]
> Usa `python digipet.py` como flujo principal cuando estés trabajando en Windows. Los scripts auxiliares deben vivir dentro de `scripts/`, no dispersos en la raíz.

---

## 🗂️ Estructura actual del proyecto

```text
Proyecto DigiPEt
│
├── .agent/                  ← Configuración local de agentes
├── .agents/                 ← Configuración adicional de agentes/herramientas
├── .codex/                  ← Configuración para flujos con Codex
├── dist/                    ← Build generado del frontend
├── logs/                    ← Logs locales del proyecto
├── node_modules/            ← Dependencias instaladas de Node
├── public/                  ← Assets públicos de la app
├── scripts/                 ← Scripts auxiliares del proyecto
├── src/                     ← Frontend React + TypeScript
├── src-tauri/               ← Backend Tauri/Rust
│
├── .dockerignore            ← Exclusiones para Docker
├── .gitignore               ← Exclusiones de Git
├── AGENTS.md                ← Reglas para agentes y asistentes de código
├── CLAUDE.md                ← Arquitectura y convenciones técnicas
├── digipet.py               ← Script principal de control del proyecto
├── docker-compose.yml       ← Orquestación Docker opcional
├── Dockerfile               ← Imagen Docker del proyecto
├── index.html               ← Entrada HTML usada por Vite
├── LICENSE                  ← Licencia MIT
├── package-lock.json        ← Lockfile de dependencias npm
├── package.json             ← Scripts y dependencias Node/Tauri
├── README.md                ← Documentación principal
├── RESUME.md                ← Resumen funcional y de producto
├── skills-lock.json         ← Lockfile/configuración de skills
├── tsconfig.json            ← Configuración TypeScript
├── tsconfig.node.json       ← Configuración TypeScript para Node/Vite
└── vite.config.ts           ← Configuración de Vite
```

---

## 🧭 Organización recomendada

### Raíz del proyecto

Debe mantenerse limpia. En la raíz solo deben quedar archivos de configuración, documentación, manifests y el script principal `digipet.py`.

### `scripts/`

Debe contener scripts auxiliares como tareas de instalación, limpieza, diagnóstico, build, mantenimiento o automatización. Si un script no es el punto de entrada principal, debe ir aquí.

### `src/`

Contiene la interfaz React/TypeScript: pantallas, componentes, hooks, store, servicios, estilos y tipos compartidos.

### `src-tauri/`

Contiene el backend Rust/Tauri: comandos IPC, seguridad, cifrado, persistencia, integridad, auditoría, capacidades e iconos nativos.

---

## 🏗️ Arquitectura del Proyecto

```text
DigiPET
│
├── src                       ← Frontend React + TypeScript
│   ├── app                   ← Inicialización y providers
│   ├── components            ← Componentes reutilizables
│   ├── features              ← Módulos de funcionalidad
│   ├── hooks                 ← Custom hooks
│   ├── layouts               ← Estructuras de página
│   ├── lib                   ← Utilitarios y helpers
│   ├── pages                 ← Vistas/rutas principales
│   ├── services              ← Comunicación con Tauri
│   ├── store                 ← Estado global
│   ├── styles                ← Tokens y estilos globales
│   └── types                 ← Tipos compartidos
│
└── src-tauri                 ← Backend Rust
    ├── capabilities          ← Permisos de Tauri
    ├── icons                 ← Iconos nativos de la app
    └── src                   ← Código Rust del núcleo seguro
```

---

## 🔐 Núcleo de Seguridad

- 🔒 Bóveda local cifrada.
- 🧂 Clave derivada desde el PIN con Argon2id.
- 🛡️ Hash seguro de credencial maestra.
- 🧠 Sesión en memoria, desmontada al bloquear.
- 📋 Inventario de activos protegidos con verificación de integridad.
- 🔑 Bloqueo y desbloqueo lógico de archivos y carpetas.
- 📜 Registro de eventos de seguridad exportable a JSON.
- ⏱️ Auto-bloqueo y umbral de intentos fallidos.
- 📷 Módulo visual desacoplado y preparado para cámara, gestos o biometría futura.

> [!NOTE]
> DigiPET no debe incluir secretos hardcodeados. Las claves se derivan en tiempo de ejecución y nunca se persisten en texto plano.

---

## 🎬 Flujo de Demo Recomendado

1. Abre una terminal en la raíz del proyecto.
2. Ejecuta `npm install` si es la primera vez o si cambió `package-lock.json`.
3. Ejecuta `python digipet.py` para abrir el flujo principal de trabajo.
4. Inicia el entorno de desarrollo desde el script o con `npm run tauri dev`.
5. Crea tu PIN maestro en el primer arranque.
6. Agrega archivos o carpetas protegidas.
7. Ejecuta un escaneo de integridad.
8. Revisa eventos recientes y exporta los logs de seguridad.

> [!IMPORTANT]
> Guarda tu PIN maestro en un lugar seguro. No existe mecanismo de recuperación por diseño.

---

## 🐳 Docker opcional

El proyecto incluye `Dockerfile`, `.dockerignore` y `docker-compose.yml` para flujos opcionales de aislamiento o automatización.

```bash
docker compose up --build
```

> [!WARNING]
> Docker no reemplaza el flujo nativo de Tauri en Windows. Úsalo solo si el script o la tarea que estás ejecutando lo requiere.

---

## 💡 Tips y Consejos

> [!TIP]
> **Flujo recomendado:** usa `python digipet.py` para tareas habituales y deja `npm run tauri dev` como alternativa directa.

> [!TIP]
> **Limpieza:** si la app se comporta de forma extraña tras cambios de estructura, limpia artefactos generados en `dist/`, caché de Vite o builds de Rust desde el flujo del script principal.

> [!TIP]
> **Rust debug:** puedes usar `RUST_LOG=debug` antes de iniciar Tauri para inspeccionar el backend.

> [!TIP]
> **Estructura:** nuevos scripts auxiliares deben agregarse en `scripts/`; nuevos módulos de UI en `src/`; nuevas operaciones sensibles en `src-tauri/`.

---

## 📬 Comunidad y Soporte

[![Web Oficial](https://img.shields.io/badge/Visita%20nuestra-Web%20Oficial-blue?style=for-the-badge&logo=wechat&logoColor=white)](https://digipet-sentinel.lovable.app)
[![GitHub Issues](https://img.shields.io/badge/Reportar%20Bug-GitHub%20Issues-red?style=for-the-badge&logo=github)](https://github.com/sl4vuk/Proyecto-DigiPEt/issues)
[![GitHub Discussions](https://img.shields.io/badge/Preguntas-Discussions-blueviolet?style=for-the-badge&logo=github)](https://github.com/sl4vuk/Proyecto-DigiPEt/discussions)

- 🌐 Visita la **Web Oficial** para más información.
- 🐛 Para bugs y sugerencias, abre un Issue en GitHub.
- ⭐ Si el proyecto te es útil, deja una estrella en el repositorio.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta `LICENSE` para más detalles.

---

<p align="center">
  Hecho con ❤️ y mucho ☕ · <strong>DigiPET v0.1.0</strong>
</p>
