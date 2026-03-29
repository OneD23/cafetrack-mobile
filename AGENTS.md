# AGENTS.md - CafeTrack Super App Monorepo

## Contexto del repositorio

Este repositorio funciona como **monorepo** y centraliza apps, backend, paquetes compartidos, documentación y scripts operativos.

## Reglas de trabajo para futuras tareas

1. **No realizar cambios destructivos sin necesidad.**
   - Evitar eliminar código útil o rutas activas.
   - Preferir cambios incrementales y compatibles.

2. **Priorizar TypeScript** en nuevo código, especialmente en `packages/*` y nuevas apps.

3. **Mantener compatibilidad** con:
   - React Native/Expo para apps móviles,
   - backend Node.js/Express existente,
   - crecimiento modular por dominios.

4. **Ubicar cada nueva funcionalidad en su carpeta correcta**:
   - apps en `apps/*`
   - módulos backend en `backend/src/modules/*`
   - código compartido en `packages/*`
   - documentación en `docs/*`
   - automatizaciones en `scripts/*`

5. **Antes de mover archivos críticos**:
   - revisar imports relativos y absolutos,
   - revisar scripts (`npm --prefix ...`) y rutas hardcodeadas,
   - revisar configuración (`package.json`, tsconfig, app.json, CI).

6. **Para módulos backend nuevos** usar convención base:
   - `controllers/`
   - `services/`
   - `routes/`
   - `index.(js|ts)`

7. **Documentar ambigüedades o decisiones abiertas** en `docs/ROADMAP.md` o `docs/ARCHITECTURE.md`.
