import { Address, BusinessCategory, BusinessItem, Order, PaymentMethod } from '../types/superApp';

export const mockCategories: BusinessCategory[] = [
  { id: 'cat-food', name: 'Comida', icon: 'restaurant-outline' },
  { id: 'cat-grocery', name: 'Supermercado', icon: 'basket-outline' },
  { id: 'cat-pharmacy', name: 'Farmacia', icon: 'medkit-outline' },
  { id: 'cat-services', name: 'Servicios', icon: 'construct-outline' },
];

export const mockBusinesses: BusinessItem[] = [
  {
    id: 'biz-1',
    name: 'Burger Point',
    categoryId: 'cat-food',
    businessType: 'cafeteria',
    description: 'Hamburguesas artesanales y combos familiares.',
    rating: 4.7,
    etaMinutes: 30,
    distanceKm: 2.3,
    products: [
      { id: 'p-1', businessId: 'biz-1', name: 'Burger clásica', price: 8.5, available: true },
      { id: 'p-2', businessId: 'biz-1', name: 'Papas medianas', price: 3.5, available: true },
    ],
  },
  {
    id: 'biz-2',
    name: 'Fresh Market',
    categoryId: 'cat-grocery',
    businessType: 'supermercado',
    description: 'Mercado de barrio con entrega en el día.',
    rating: 4.5,
    etaMinutes: 40,
    distanceKm: 1.7,
    products: [
      { id: 'p-3', businessId: 'biz-2', name: 'Combo frutas', price: 12, available: true },
      { id: 'p-4', businessId: 'biz-2', name: 'Leche deslactosada', price: 2.2, available: true },
    ],
  },
];

export const mockAddresses: Address[] = [
  { id: 'addr-1', label: 'Casa', street: 'Av. Central 123', city: 'Ciudad Local', notes: 'Portón gris' },
  { id: 'addr-2', label: 'Trabajo', street: 'Calle 45 #12-30', city: 'Ciudad Local' },
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pay-1', label: 'Efectivo', type: 'cash' },
  { id: 'pay-2', label: 'Tarjeta terminada en 4242', type: 'card' },
  { id: 'pay-3', label: 'Wallet Super App', type: 'wallet' },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1001',
    businessId: 'biz-1',
    businessName: 'Burger Point',
    items: [
      { productId: 'p-1', name: 'Burger clásica', quantity: 2, unitPrice: 8.5 },
    ],
    subtotal: 17,
    tax: 2.72,
    total: 19.72,
    status: 'accepted',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    address: mockAddresses[0],
    paymentMethod: mockPaymentMethods[1],
  },
];
