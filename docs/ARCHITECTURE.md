# Arquitectura inicial - Super App

## Visión

Construir una plataforma modular que permita operar múltiples verticales (pedidos, delivery, marketplace, servicios) sobre una misma base tecnológica, manteniendo crecimiento incremental y bajo riesgo de ruptura.

## Principios técnicos

1. **Monorepo con límites claros** por dominio (`apps`, `backend`, `packages`).
2. **Compatibilidad primero**: preservar funcionamiento actual de backend y app móvil.
3. **Modularidad**: cada dominio de negocio debe poder evolucionar con independencia.
4. **TypeScript-first** para nuevo código compartido y contratos de datos.
5. **No cambios destructivos** sin necesidad operacional.

## Componentes

### Apps
- `apps/mobile-client`: experiencia cliente final (pedidos, tracking, wallet).
- `apps/mobile-driver`: repartidor/conductor (aceptación de viajes, estado de entrega).
- `apps/mobile-business`: panel operativo de negocio (catálogo, pedidos, disponibilidad).
- `apps/web-admin`: panel administrativo global (supervisión, soporte, métricas).

### Backend
- API principal Node.js/Express en `backend`.
- Módulos de dominio en `backend/src/modules/*`.
- Rutas heredadas actuales se mantienen para continuidad.
- Rutas modulares base expuestas como `/api/v1/<module>`.

### Shared packages
- `packages/types`: contratos y modelos de datos comunes.
- `packages/utils`: utilidades transversales.
- `packages/config`: configuración común y variables compartidas.
- `packages/api-client`: cliente HTTP reusable.

## Roles del sistema

- **cliente**: compra productos/servicios, rastrea pedidos y pagos.
- **negocio**: administra catálogo, disponibilidad y órdenes.
- **repartidor/conductor**: gestiona entregas y estado de trayecto.
- **vendedor marketplace**: publica y gestiona items del marketplace.
- **administrador**: gestiona operación, moderación, soporte y métricas.
