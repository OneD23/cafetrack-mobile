# mobile-business

App móvil para dueños de negocio (ejemplo: cafetería/cafetruck), enfocada en operación POS e inventario.

## Estado

- Usa el flujo de negocio que ya estaba configurado (POS, inventario, clientes, contabilidad y ajustes).
- Incluye pantalla `Pedidos OneD Hub` para gestionar pedidos externos (aceptar/rechazar/cambiar estado).
- Reutiliza temporalmente módulos de `apps/mobile-client/src/*` para evitar ruptura mientras se completa una separación total.

## Ejecutar

```bash
npm --prefix apps/mobile-business run start
```
