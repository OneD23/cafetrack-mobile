import { BusinessVertical } from '../types/business';

interface PosConfig {
  title: string;
  subtitle: string;
  quickActions: string[];
  metrics: Array<{ label: string; value: string }>;
}

export const posRegistry: Record<BusinessVertical, PosConfig> = {
  cafeteria: {
    title: 'POS Cafetería',
    subtitle: 'Ventas rápidas de bebidas, panadería y combos.',
    quickActions: ['Nuevo café', 'Combo desayuno', 'Pedido para llevar', 'Aplicar descuento'],
    metrics: [
      { label: 'Ticket promedio', value: '$8.40' },
      { label: 'Órdenes hoy', value: '126' },
      { label: 'Tiempo prep.', value: '6 min' },
    ],
  },
  ferreteria: {
    title: 'POS Ferretería',
    subtitle: 'Control de herramientas, materiales y cotizaciones rápidas.',
    quickActions: ['Nueva cotización', 'Venta por código', 'Factura fiscal', 'Separar pedido'],
    metrics: [
      { label: 'SKU activos', value: '2,340' },
      { label: 'Órdenes hoy', value: '74' },
      { label: 'Margen bruto', value: '29%' },
    ],
  },
  supermercado: {
    title: 'POS Supermercado',
    subtitle: 'Checkout de alto volumen y control de canasta.',
    quickActions: ['Cobro rápido', 'Escanear producto', 'Aplicar cupón', 'Validar balanza'],
    metrics: [
      { label: 'Transacciones', value: '412' },
      { label: 'Canasta prom.', value: '$23.10' },
      { label: 'Items/min', value: '37' },
    ],
  },
  colmado: {
    title: 'POS Colmado',
    subtitle: 'Venta de proximidad con fiado y despacho inmediato.',
    quickActions: ['Venta mostrador', 'Registrar fiado', 'Entrega moto', 'Recargar balance'],
    metrics: [
      { label: 'Ventas hoy', value: '$1,920' },
      { label: 'Clientes', value: '189' },
      { label: 'Fiado activo', value: '$420' },
    ],
  },
  barberia_salon: {
    title: 'POS Barbería / Salón',
    subtitle: 'Agenda, turnos y cobro de servicios estéticos.',
    quickActions: ['Nueva cita', 'Check-in cliente', 'Servicio express', 'Cerrar caja'],
    metrics: [
      { label: 'Citas hoy', value: '38' },
      { label: 'Ocupación', value: '86%' },
      { label: 'Ticket prom.', value: '$14.70' },
    ],
  },
};
