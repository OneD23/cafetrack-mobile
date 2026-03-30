# OneHub Business Core - Fase 1 (Backlog técnico ejecutable)

## Objetivo de la fase

Convertir la base actual de CafeTrack en un **núcleo operativo multi-negocio** para OneHub Business, conectado a backend real, sin mocks críticos y con base escalable para nuevos verticales.

---

## Resultado de la fase (Definition of Done)

La fase queda cerrada solo cuando este flujo funciona end-to-end:

1. Un usuario de negocio inicia sesión contra `/api/v1/auth/login`.
2. La app hidrata sesión persistida y carga `user + business`.
3. POS carga productos reales por `businessId`.
4. Se completa una venta real en backend.
5. Inventario se ajusta desde backend por la venta.
6. Reportes muestran la venta registrada.
7. Todas las entidades operativas quedan asociadas a `businessId`.

---

## Decisiones técnicas de fase (cerradas)

1. **Una sola estrategia de API en frontend (fase 1):** mantener `ApiClient` como flujo principal.
2. **Congelar `apiSlice` temporalmente:** no crecer RTK Query hasta su integración completa.
3. **Unificar store:** una sola configuración Redux activa para app de negocio.
4. **Versionado de rutas backend:** nuevas rutas operativas bajo `/api/v1`.
5. **Modelo multi-negocio desde base de datos:** `businessId` obligatorio en dominio operativo.

---

## Entregables oficiales

- **Entregable 1:** Auth real + entidad Business.
- **Entregable 2:** POS real consumiendo productos API.
- **Entregable 3:** Inventario + ventas reales.
- **Entregable 4:** Base multi-negocio (type + enabledModules).

---

## Backlog priorizado

## Bloque A - Crítico

### A1. Unificación de store
**Backend:** N/A  
**Frontend:**
- [ ] Identificar los puntos donde se crea/configura store duplicado.
- [ ] Consolidar reducers, middlewares y persistencia en un único store.
- [ ] Ajustar providers y hooks para usar una sola instancia.

**Criterio de aceptación:** no existe doble provider ni doble estado global en runtime.

### A2. Estrategia API única
**Frontend:**
- [ ] Catalogar endpoints consumidos por `ApiClient` y por `apiSlice`.
- [ ] Migrar llamadas críticas de fase 1 a `ApiClient`.
- [ ] Marcar `apiSlice` como congelado (sin nuevas features durante fase 1).

**Criterio de aceptación:** auth, productos, inventario, ventas y reportes se consumen por una única capa.

### A3. Auth real
**Backend (`/api/v1/auth`):**
- [ ] Implementar `POST /login` con validación de credenciales.
- [ ] Emitir JWT con `userId`, `businessId`, `role`.
- [ ] Implementar `GET /me` para sesión activa.

**Frontend:**
- [ ] Remover login fake del `authSlice`.
- [ ] Consumir `POST /api/v1/auth/login`.
- [ ] Persistir token seguro y datos `user + business`.
- [ ] Hidratar sesión al abrir la app (`/auth/me`).
- [ ] `logout` debe limpiar token y estado.

**Criterio de aceptación:** login real funcional y sesión persistida tras reinicio de app.

### A4. Entidad Business como núcleo
**Backend:**
- [ ] Definir/ajustar modelo `Business` con campos mínimos:
  `id, name, slug, type, status, phone, email, address, logoUrl, settings, enabledModules, createdAt, updatedAt`.
- [ ] Exponer `GET /api/v1/businesses/:businessId`.
- [ ] Exponer `GET /api/v1/businesses/:businessId/users` (roles básicos).

**Criterio de aceptación:** cada sesión autenticada retorna negocio asociado y configuración activa.

---

## Bloque B - Operativo

### B1. Productos reales en POS
**Backend:**
- [ ] `GET /api/v1/products` (filtrado por `businessId`, paginación básica).
- [ ] `GET /api/v1/products/:id`.

**Frontend:**
- [ ] Eliminar dependencia de `defaultProducts` en POS.
- [ ] Cargar productos reales según negocio autenticado.
- [ ] Mostrar stock real e impedir venta inválida por stock.

**Criterio de aceptación:** POS opera únicamente con datos API.

### B2. Inventario real (InventoryItem)
**Backend:**
- [ ] `GET /api/v1/inventory`.
- [ ] `POST /api/v1/inventory`.
- [ ] `PATCH /api/v1/inventory/:id/restock`.
- [ ] `PATCH /api/v1/inventory/:id/adjust`.
- [ ] `DELETE /api/v1/inventory/:id`.

**Frontend:**
- [ ] Conectar `InventoryScreen` a endpoints reales.
- [ ] Generalizar vocabulario a inventario (no solo ingredientes).
- [ ] Mantener recetas condicionadas por tipo de negocio.

**Criterio de aceptación:** CRUD y ajustes de stock persistidos en backend.

### B3. Ventas reales
**Backend:**
- [ ] `POST /api/v1/sales` crea venta con `businessId` y `cashierUserId`.
- [ ] Registrar `items, subtotal, discount, tax, total, paymentMethod, source`.
- [ ] Disparar ajuste de inventario por venta (transaccional o compensado).

**Frontend:**
- [ ] Reemplazar simulación local de checkout por `POST /sales`.
- [ ] Conservar carrito hasta confirmación backend.
- [ ] Manejar errores de venta y reintentos.

**Criterio de aceptación:** cada venta en app genera registro real en backend.

### B4. Reportes reales
**Backend:**
- [ ] `GET /api/v1/reports/summary` por `businessId` y rango fecha.

**Frontend:**
- [ ] `ReportsScreen` consume métricas del backend.
- [ ] Dejar métricas locales solo como fallback temporal (si aplica).

**Criterio de aceptación:** reportes reflejan ventas reales registradas.

---

## Bloque C - Escalabilidad

### C1. Soporte multi-negocio básico
**Backend:**
- [ ] Tipos iniciales permitidos: `cafe`, `colmado`, `ferreteria`.
- [ ] Guardar `enabledModules` por negocio.

**Frontend:**
- [ ] Cargar capacidades desde `business.type` y `business.enabledModules`.
- [ ] Gatear módulos por configuración del negocio.

**Criterio de aceptación:** la app activa/desactiva módulos según el negocio autenticado.

### C2. Roles básicos
**Backend:**
- [ ] Roles mínimos: `owner`, `admin`, `cashier`.
- [ ] Middleware por rol en rutas sensibles.

**Frontend:**
- [ ] Ocultar acciones no permitidas según rol.

**Criterio de aceptación:** permisos básicos aplicados de extremo a extremo.

---

## Contratos mínimos recomendados

### Respuesta de login
```json
{
  "token": "jwt",
  "user": {
    "id": "u1",
    "name": "Administrador",
    "email": "admin@negocio.com",
    "role": "owner",
    "businessId": "b1"
  },
  "business": {
    "id": "b1",
    "name": "Cafeteando",
    "type": "cafe",
    "status": "active",
    "enabledModules": ["pos", "inventory", "reports", "recipes"]
  }
}
```

### Modelo Product (fase 1)
```json
{
  "id": "p1",
  "businessId": "b1",
  "name": "Café Latte",
  "description": "12 oz",
  "price": 180,
  "category": "bebidas",
  "sku": "CAF-LAT-12",
  "stock": 25,
  "minStock": 5,
  "isActive": true,
  "businessType": "cafe",
  "imageUrl": "https://..."
}
```

### Modelo InventoryItem (fase 1)
```json
{
  "id": "i1",
  "businessId": "b1",
  "name": "Café molido",
  "unit": "kg",
  "stock": 8,
  "minStock": 2,
  "costPerUnit": 220,
  "type": "raw_material"
}
```

### Modelo Sale (fase 1)
```json
{
  "id": "s1",
  "businessId": "b1",
  "cashierUserId": "u2",
  "items": [],
  "subtotal": 1000,
  "discount": 0,
  "tax": 180,
  "total": 1180,
  "paymentMethod": "cash",
  "source": "local_pos",
  "createdAt": "2026-03-30T00:00:00.000Z"
}
```

---

## Plan de ejecución sugerido (secuencial)

1. Backend auth/business.
2. Frontend auth/session.
3. Backend products/inventory/sales/reports.
4. Frontend POS/inventory/reports.
5. Capa multi-negocio y roles.
6. QA de flujo end-to-end con negocio real.

---

## Checklist final de validación de fase

- [ ] Login real funcionando con JWT.
- [ ] Sesión persistida y recuperada por `/auth/me`.
- [ ] POS sin productos mock.
- [ ] Venta real persistida en backend.
- [ ] Inventario actualizado por venta.
- [ ] Reportes con datos reales.
- [ ] Todo asociado a `businessId`.
- [ ] Tipo de negocio y módulos habilitados aplicados.
