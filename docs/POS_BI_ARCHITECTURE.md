# POS BI Arquitectura (Cafeterías / Retail)

## 1) Estructura del módulo de reportes

- `GET /api/reports/kpis`
- `GET /api/reports/sales/heatmap`
- `GET /api/reports/products/profitability?format=json|csv`
- `GET /api/reports/inventory/consumption`

Todos soportan filtros por `startDate` y `endDate` para operar por día/semana/mes/rango.

## 2) Colecciones necesarias (núcleo + BI)

- `users` (roles: admin, manager, cashier)
- `products` (precio, categoría, activo, receta)
- `ingredients` (stock, mínimo, costo unitario)
- `recipes` (insumos por producto)
- `sales` (header de venta)
- `inventorymovements` (auditoría de stock)
- `customers` (fidelización)
- `cash_closures` (recomendado para cierre formal por sesión)
- `audit_logs` (recomendado para acciones críticas)

## 3) Diseño de venta recomendado (BI-ready)

Cada venta debe persistir:

- `createdAt`, `cashier`, `paymentMethod`
- `subtotal`, `discount.{type,value,amount}`, `tax`, `total`
- `items[]` con `product`, `quantity`, `price`, `cost`, `total`
- `operationId` (idempotencia)
- `status` (`completed`, `cancelled`, `refunded`)

## 4) Lógica de agregación por dominio

### Ventas
- netSales = sum(`sales.total`)
- grossSales = sum(`sales.subtotal`)
- ticketPromedio = `netSales / transacciones`
- horas pico = group by hour(createdAt)
- días pico = group by dayOfWeek(createdAt)
- por cajero = group by `cashier`
- por método = group by `paymentMethod`

### Productos
- ingresos por producto = sum(`items.total`)
- costo por producto = sum(`items.cost * items.quantity`)
- utilidad = ingresos - costo
- margen% = utilidad / ingresos

### Inventario
- valor inventario = sum(`stock * costPerUnit`)
- bajo stock = `stock <= minStock`
- consumo = sum(abs(quantity<0)) en `inventorymovements`
- reposición = sum(quantity>0)
- ajustes/mermas = filtrar por `type`

### Caja
- apertura/cierre por sesión (recomendado colecc. `cash_closures`)
- esperado vs contado
- descuadre = contado - esperado

## 5) KPIs obligatorios (fórmulas)

- Ventas brutas = Σ subtotal
- Ventas netas = Σ total
- Utilidad bruta = Σ(total - costo)
- Ticket promedio = ventas netas / #ventas
- Cantidad ventas = #transacciones
- Productos vendidos = Σ cantidades
- % por método = ventas método / ventas netas
- Margen promedio = utilidad bruta / ventas netas
- % stock bajo = ingredientes bajos / ingredientes totales

## 6) Frontend dashboard recomendado

- Tarjetas KPI: netas, brutas, utilidad, ticket promedio, transacciones.
- Tabla: top 10 productos por utilidad.
- Barras: ventas por método de pago.
- Líneas: tendencia por día/hora.
- Tabla inventario: consumo, reposición, ajustes.
- Exportación: CSV (Excel-compatible) y PDF (fase 2).

## 7) Exportaciones

- CSV implementable en endpoints de reportes con `format=csv`.
- PDF recomendado en backend con plantilla server-side (fase 2).

## 8) Preguntas de negocio que debe responder

- ¿Qué producto deja más utilidad real?
- ¿Qué producto vende mucho pero gana poco?
- ¿Qué ingrediente se consume más rápido?
- ¿Qué horario y qué día venden más?
- ¿Qué cajero vende más?
- ¿Qué % entra en efectivo?
- ¿Cuánto dinero está inmovilizado en inventario?
- ¿Hay descuadre de caja?

## 9) Roadmap de robustez recomendado

1. Validación backend estricta + idempotencia (activo).
2. Caja formal (`cash_closures`) + auditoría (`audit_logs`).
3. Devoluciones/anulaciones con reversión de inventario.
4. Export PDF/Excel avanzado.
5. Monitoreo operativo y alertas.
