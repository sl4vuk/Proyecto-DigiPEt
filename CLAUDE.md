# CLAUDE.md

## Propósito

Este documento describe la arquitectura objetivo y convenciones del proyecto DigiPET, una aplicación desktop de seguridad, monitoreo local y gestión segura de archivos construida sobre Tauri 2.

## Principios

- Core sensible en Rust, UI en React.
- Nada de secretos embebidos.
- Configuración persistente mínima en claro.
- Datos operativos sensibles en bóveda cifrada.
- UI premium, sobria, enterprise y fácil de demostrar.
- Módulos desacoplados para permitir evolución sin deuda estructural.

## Separación de responsabilidades

### Frontend
Responsable de navegación, interacción, presentación, UX, estados de carga, formularios y composición visual.

### Backend Tauri
Responsable de:
- cifrado y descifrado del contenedor
- hashing y verificación de PIN
- persistencia segura
- auditoría local
- integridad de archivos y carpetas
- exportación de eventos
- bloqueo de sesión y respuesta de emergencia

### Módulo visual
Responsable de:
- preview de webcam
- verificación de disponibilidad
- calibración inicial
- generación de eventos visuales
- futura integración de biometría o gestos

## Modelo de persistencia

### state.json
Metadatos mínimos de control:
- inicialización
- hash de PIN
- salt de derivación
- intentos fallidos
- lockout temporal
- eventos previos al desbloqueo

### vault.secure.json
Contenedor cifrado con:
- activos protegidos
- eventos
- ajustes
- última ejecución de integridad

## Convenciones

- Las mutaciones del backend devuelven el estado hidratado listo para pintar.
- Los eventos más recientes van primero.
- Toda falla importante debe incluir contexto del módulo.
- Las vistas deben incluir estados vacíos y feedback claro.
- El tema debe funcionar en claro, oscuro y sistema.

## Evolución sugerida

1. Integrar watchers del sistema de archivos
2. Añadir aceptación de cambios de integridad
3. Conectar pipeline biométrico real
4. Añadir firma binaria y actualización segura
5. Incorporar pruebas de integración y E2E
