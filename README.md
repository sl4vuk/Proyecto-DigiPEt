# ⚡ DigiPET

[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge&logo=github&color=%230567ff)](https://github.com/sl4vuk/Proyecto-DigiPEt/releases/latest)
[![Platform](https://img.shields.io/badge/platform-Windows-informational?style=for-the-badge&logo=windows&color=%230078d4)](https://github.com/sl4vuk/Proyecto-DigiPEt)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-blueviolet?style=for-the-badge&logo=tauri)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-Secure%20Core-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-Canal%20Oficial-blue?style=for-the-badge&logo=telegram)](https://t.me/TU_CANAL_AQUI)

> DigiPET es una aplicación de escritorio para protección local de archivos, monitoreo seguro, auditoría e integridad, construida con **Tauri 2**, **React 19**, **TypeScript 5**, **Vite** y un núcleo en **Rust**.

---

## 📦 Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Tauri | 2.x | Shell nativo de escritorio |
| React | 19.1 | Interfaz de usuario |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7.x | Bundler y dev server |
| Tailwind CSS | 4.x | Sistema de estilos |
| Zustand | 5.x | Gestión de estado |
| Framer Motion | 12.x | Animaciones |
| Lucide Icons | 0.542 | Iconografía |
| Rust | stable | Núcleo criptográfico |

---

## 🚀 Inicio Rápido

### 1. Instalar prerequisitos

```bat
dependencis.bat
```

### 2. Arrancar en modo desarrollo

```bat
dev.bat
```

### 3. (Alternativo) Comandos npm

```bash
npm install          # instalar dependencias
npm run tauri dev    # modo desarrollo con hot-reload
npm run tauri build  # compilar release
```

> [!TIP]
> Usa `dev.bat` en lugar de los comandos npm directamente — incluye panel de control interactivo con diagnóstico, logs, limpieza y reintentos automáticos.

---

## 🗂️ Scripts incluidos

| Archivo | Descripción |
|---|---|
| `dependencis.bat` | Instala Node LTS, Rustup, Build Tools y dependencias del proyecto en Windows |
| `dev.bat` | Panel de control para desarrollo: diagnóstico, logs, limpieza y reintentos |
| `run.bat` | Inicia DigiPET en desarrollo usando el comando principal del proyecto |

---

## 🏗️ Arquitectura del Proyecto

```text
DigiPET
│
├── /src                      ← Frontend React + TypeScript
│   ├── /app                  ← Inicialización y providers
│   ├── /components           ← Componentes reutilizables
│   ├── /features             ← Módulos de funcionalidad
│   ├── /hooks                ← Custom hooks
│   ├── /layouts              ← Estructuras de página
│   ├── /lib                  ← Utilitarios y helpers
│   ├── /pages                ← Vistas/rutas principales
│   ├── /services             ← Comunicación con Tauri
│   ├── /store                ← Estado global (Zustand)
│   ├── /styles               ← Tokens y estilos globales
│   └── /types                ← Tipos TypeScript compartidos
│
└── /src-tauri                ← Backend Rust
    ├── /capabilities         ← Permisos de Tauri
    ├── /icons                ← Iconos de la app
    └── /src
        ├── app_state.rs      ← Estado de la aplicación
        ├── commands.rs       ← Comandos IPC expuestos
        ├── error.rs          ← Tipos de error unificados
        ├── integrity.rs      ← Verificación de integridad
        ├── models.rs         ← Estructuras de datos
        ├── security.rs       ← Lógica criptográfica
        └── storage.rs        ← Persistencia cifrada
```

---

## 🔐 Núcleo de Seguridad

- 🔒 Bóveda local cifrada con **AES-256-GCM**
- 🧂 Clave derivada desde el PIN con **Argon2id**
- 🛡️ Hash seguro de credencial maestra
- 🧠 Sesión en memoria, desmontada al bloquear
- 📋 Inventario de activos protegidos con integridad local
- 🔑 Bloqueo y desbloqueo lógico mediante atributos de solo lectura
- 📜 Registro de eventos de seguridad exportable a **JSON**
- ⏱️ Política de auto-bloqueo y umbral de intentos fallidos
- 📷 Módulo de cámara desacoplado y listo para inferencia biométrica real

> [!NOTE]
> DigiPET no incluye secretos hardcodeados. Todas las claves se derivan en tiempo de ejecución y nunca se persisten en texto plano.

---

## 🎬 Flujo de Demo Recomendado

1. Ejecuta `dependencis.bat` para preparar el entorno
2. Ejecuta `dev.bat` y elige la opción de **desarrollo**
3. Crea tu **PIN maestro** en el primer arranque
4. Agrega archivos o carpetas a la bóveda
5. Ejecuta un **escaneo de integridad**
6. Abre incidentes y exporta los **logs de seguridad**

> [!IMPORTANT]
> Guarda tu PIN maestro en un lugar seguro. No existe mecanismo de recuperación por diseño — esto es intencional para maximizar la seguridad.

---

## 💡 Tips y Consejos

> [!TIP]
> **Rendimiento en desarrollo:** Si el hot-reload de Tauri es lento, prueba a correr `npm run dev` por separado (solo Vite) para iterar en la UI sin el proceso Rust.

> [!TIP]
> **Debug del núcleo Rust:** Agrega `RUST_LOG=debug` como variable de entorno antes de `npm run tauri dev` para ver logs detallados del backend.

> [!TIP]
> **Limpieza de caché:** Si la app se comporta de forma extraña tras un cambio de estructura, usa la opción **Limpiar** en `dev.bat` para borrar el caché de Vite y los artefactos de Rust.

> [!TIP]
> **Extensibilidad visual:** El módulo de cámara está preparado para integrar **MediaPipe**, **OpenCV** o cualquier motor biométrico sin reescribir el core. Solo implementa el trait correspondiente en `src-tauri/src`.

> [!WARNING]
> No ejecutes `npm run tauri build` en modo de desarrollo sin antes hacer `npm install` limpio. Una instalación corrupta puede generar binarios inseguros.

---

## 📬 Comunidad y Soporte

[![Telegram](https://img.shields.io/badge/Únete%20al%20Canal-Telegram-blue?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/TU_CANAL_AQUI)
[![GitHub Issues](https://img.shields.io/badge/Reportar%20Bug-GitHub%20Issues-red?style=for-the-badge&logo=github)](https://github.com/sl4vuk/Proyecto-DigiPEt/issues)
[![GitHub Discussions](https://img.shields.io/badge/Preguntas-Discussions-blueviolet?style=for-the-badge&logo=github)](https://github.com/sl4vuk/Proyecto-DigiPEt/discussions)

- 💬 Para preguntas rápidas úsate el canal de **Telegram**
- 🐛 Para bugs y sugerencias, abre un **Issue** en GitHub
- ⭐ Si el proyecto te es útil, deja una **estrella** en el repositorio

---

## 🏅 Contribuidores

¡Gracias a todos los que dedican tiempo a hacer crecer este proyecto! 🍻

[![Contributors](https://contrib.rocks/image?repo=sl4vuk/Proyecto-DigiPEt)](https://github.com/sl4vuk/Proyecto-DigiPEt/graphs/contributors)

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

---

<p align="center">
  Hecho con ❤️ y mucho ☕ · <strong>DigiPET v0.1.0</strong>
</p>
