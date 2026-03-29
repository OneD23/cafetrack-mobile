# CafeTrack Super App Monorepo

Monorepo base para evolucionar CafeTrack hacia una **Super App local y escalable**, combinando:
- pedidos y delivery,
- marketplace,
- servicios bajo demanda,
- herramientas para negocio y administración.

## Estructura principal

```text
apps/
  mobile-client/
  mobile-driver/
  mobile-business/
  web-admin/
backend/
packages/
  types/
  utils/
  config/
  api-client/
docs/
scripts/
```

## Estado actual

- Se movió la app móvil existente a `apps/mobile-client`.
- `backend` se mantiene operativo y se preparó una estructura modular en `backend/src/modules`.
- Se creó `packages/*` para componentes compartidos TypeScript.
- Se agregó documentación inicial de arquitectura, roadmap y módulos.

## Comandos rápidos

Desde la raíz del repo:

```bash
npm run dev:backend
npm run dev:mobile-client
npm run check:mobile-client
```

También puedes usar comandos directos con prefijos:

```bash
npm --prefix backend run dev
npm --prefix apps/mobile-client run start
```

## MVP técnico base preparado

Módulos base creados en backend:
- autenticación
- usuarios
- negocios
- productos
- pedidos
- delivery básico

Además quedaron preparadas bases para:
- marketplace
- servicios bajo demanda
- wallet/pagos
- panel de negocio
- panel admin

> Ver `docs/ARCHITECTURE.md`, `docs/MODULES.md` y `docs/ROADMAP.md` para el detalle de responsabilidades y fases.
