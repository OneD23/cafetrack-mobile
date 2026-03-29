# MVP Mobile Client - Estado de implementación

## Implementado

- Flujo Auth:
  - `LoginScreen`
  - `RegisterScreen`
- Home:
  - buscador principal
  - categorías
  - negocios cercanos
- Negocios:
  - lista de negocios
  - detalle de negocio
  - agregado al carrito
- Compra:
  - carrito
  - checkout (dirección + método de pago + resumen)
- Pedidos:
  - listado
  - detalle
  - flujo visual de estados
- Perfil:
  - datos de usuario
  - direcciones mock
  - configuración básica inicial
- Navegación:
  - tabs: Inicio, Pedidos, Perfil
  - stack para detalle/carrito/checkout
- Estado global:
  - `superAuth`, `superBusiness`, `superCart`, `superOrders`

## Mocks temporales

Se usan mocks en `src/services/mockData.ts` y fallback en `src/services/superAppApi.ts` para:
- catálogo de categorías/negocios/productos,
- direcciones,
- métodos de pago,
- pedidos.

> Nota: Se mantiene compatibilidad con el backend actual y no se reemplazan rutas legacy.

## Pendiente de conexión backend

- endpoints cliente final para negocio/catálogo/pedidos en backend (`/api/v1/businesses`, `/api/v1/orders`, etc.),
- checkout real y creación persistente de pedidos,
- tracking en tiempo real con ubicación de delivery.
