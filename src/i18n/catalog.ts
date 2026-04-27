export const catalog = {
  "es-PE": {
    nav: {
      dashboard: "Dashboard",
      protectedItems: "Activos",
      incidents: "Incidentes",
      camera: "Cámara",
      terminal: "Terminal",
      settings: "Ajustes"
    },
    topbar: {
      shell: "Consola DigiPET",
      localOnly: "Operación local, sin telemetría remota",
      notifications: "Alertas",
      status: "Estado",
      lock: "Bloquear",
      openSearch: "Abrir búsqueda",
      closeSearch: "Cerrar búsqueda",
      searchPlaceholder: "Buscar activos, eventos o rutas",
      collapseSidebar: "Contraer navegación",
      expandSidebar: "Expandir navegación"
    },
    pages: {
      dashboardEyebrow: "dashboard",
      dashboardTitle: "Postura general del entorno",
      dashboardDescription: "Resumen ejecutivo del estado seguro, integridad local y actividad reciente del equipo.",
      protectedEyebrow: "inventario",
      protectedTitle: "Gestión de archivos y carpetas protegidas",
      protectedDescription: "Alta, bloqueo, ocultación y control masivo sobre el inventario local.",
      incidentsEyebrow: "incidentes",
      incidentsTitle: "Historial de eventos y respuesta",
      incidentsDescription: "Trazabilidad de autenticación, integridad, actividad del core y señales sospechosas.",
      cameraEyebrow: "módulo visual",
      cameraTitle: "Cámara y vigilancia visual",
      cameraDescription: "Vista desacoplada para calibración, pruebas y futura inferencia biométrica o por gestos.",
      settingsEyebrow: "ajustes",
      settingsTitle: "Preferencias, idioma y seguridad",
      settingsDescription: "Todos los cambios persisten automáticamente y en silencio.",
      terminalEyebrow: "terminal",
      terminalTitle: "Terminal segura",
      terminalDescription: "Vista compacta preparada para ejecución segura mediante allowlist y permisos explícitos."
    },
    actions: {
      rescan: "Revalidar integridad",
      addFiles: "Agregar archivos",
      addFolder: "Agregar carpeta",
      exportLogs: "Exportar logs",
      emergencyLock: "Bloqueo de emergencia",
      startPreview: "Iniciar preview",
      stopPreview: "Detener preview",
      simulateIncident: "Simular incidente",
      calibrate: "Calibrar perfil visual",
      retry: "Reintentar"
    },
    settings: {
      theme: "Tema",
      language: "Idioma",
      autoLock: "Auto bloqueo (min)",
      threshold: "Umbral de intentos",
      localeHint: "La interfaz cambia sin reiniciar la app.",
      defaultRoots: "Rutas por defecto",
      cameraModule: "Módulo de cámara",
      emergencyMode: "Modo de emergencia",
      currentPin: "PIN actual",
      nextPin: "Nuevo PIN",
      confirmPin: "Confirmación"
    },
    terminal: {
      unavailable: "La ejecución real sigue protegida por un stub seguro.",
      commandPlaceholder: "Comando permitido por allowlist",
      execute: "Ejecutar",
      allowlist: "Comandos previstos",
      stubTitle: "Modo seguro activo"
    }
  },
  "en-US": {
    nav: {
      dashboard: "Dashboard",
      protectedItems: "Assets",
      incidents: "Incidents",
      camera: "Camera",
      terminal: "Terminal",
      settings: "Settings"
    },
    topbar: {
      shell: "DigiPET Console",
      localOnly: "Local operation, no remote telemetry",
      notifications: "Alerts",
      status: "Status",
      lock: "Lock",
      openSearch: "Open search",
      closeSearch: "Close search",
      searchPlaceholder: "Search assets, events, or paths",
      collapseSidebar: "Collapse navigation",
      expandSidebar: "Expand navigation"
    },
    pages: {
      dashboardEyebrow: "dashboard",
      dashboardTitle: "Environment posture overview",
      dashboardDescription: "Executive summary of secure status, local integrity and recent activity.",
      protectedEyebrow: "inventory",
      protectedTitle: "Protected files and folders",
      protectedDescription: "Add, lock, hide and manage the protected local inventory.",
      incidentsEyebrow: "incidents",
      incidentsTitle: "Event history and response",
      incidentsDescription: "Trace authentication, integrity, core activity and suspicious signals.",
      cameraEyebrow: "visual module",
      cameraTitle: "Camera and visual monitoring",
      cameraDescription: "Decoupled view for calibration, testing and future biometric or gesture inference.",
      settingsEyebrow: "settings",
      settingsTitle: "Preferences, language and security",
      settingsDescription: "Every change persists automatically and silently.",
      terminalEyebrow: "terminal",
      terminalTitle: "Secure terminal",
      terminalDescription: "Compact view prepared for safe execution through allowlists and explicit permissions."
    },
    actions: {
      rescan: "Rescan integrity",
      addFiles: "Add files",
      addFolder: "Add folder",
      exportLogs: "Export logs",
      emergencyLock: "Emergency lock",
      startPreview: "Start preview",
      stopPreview: "Stop preview",
      simulateIncident: "Simulate incident",
      calibrate: "Calibrate visual profile",
      retry: "Retry"
    },
    settings: {
      theme: "Theme",
      language: "Language",
      autoLock: "Auto lock (min)",
      threshold: "Attempt threshold",
      localeHint: "The interface changes without restarting the app.",
      defaultRoots: "Default roots",
      cameraModule: "Camera module",
      emergencyMode: "Emergency mode",
      currentPin: "Current PIN",
      nextPin: "New PIN",
      confirmPin: "Confirmation"
    },
    terminal: {
      unavailable: "Real execution is still protected by a secure stub.",
      commandPlaceholder: "Allowlisted command",
      execute: "Run",
      allowlist: "Planned commands",
      stubTitle: "Secure mode enabled"
    }
  }
} as const;

export type SupportedLocale = keyof typeof catalog;
export type TranslationTree = (typeof catalog)[SupportedLocale];
