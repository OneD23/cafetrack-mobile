# Módulos y responsabilidades

## Módulos MVP (base técnica creada)

### auth
- registro/login
- refresco de tokens
- sesiones y seguridad base

### users
- perfil de usuario
- roles y estado de cuenta
- preferencias principales

### businesses
- alta/edición de negocio
- horarios y estado de operación
- datos comerciales básicos

### products
- catálogo de productos
- precio y disponibilidad
- organización por categorías (pendiente de implementación)

### orders
- creación de orden
- ciclo de vida del pedido
- cálculo básico de totales

### delivery
- asignación de repartidor
- estados de entrega
- ubicación actual (base para tracking)

## Módulos futuros preparados

### marketplace
- publicaciones de terceros
- gestión de inventario marketplace
- pedidos marketplace

### services
- solicitud de servicios bajo demanda
- asignación y seguimiento de prestadores

### payments (wallet)
- saldo de usuario
- movimientos y ledger
- integración con pasarelas

## Módulos de paneles

### mobile-business
- operación diaria del negocio
- gestión de pedidos y catálogo

### web-admin
- monitoreo global
- soporte y moderación
- configuración operativa

## Convenciones recomendadas backend por módulo

```text
src/modules/<module>/
  controllers/
  services/
  routes/
  index.js
```

Cada módulo debe exponer `router` y su definición de dominio para registro central.
