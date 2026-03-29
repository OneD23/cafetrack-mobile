import { api } from '../api/client';
import {
  Address,
  AuthSession,
  BusinessCategory,
  BusinessItem,
  Order,
  PaymentMethod,
} from '../types/superApp';
import { mockAddresses, mockBusinesses, mockCategories, mockOrders, mockPaymentMethods } from './mockData';

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultProductsForBusiness = (businessId: string) => [
  {
    id: `${businessId}-default-1`,
    businessId,
    name: 'Producto OneD Hub',
    description: 'Producto base para pedidos Fase 1',
    price: 8.99,
    available: true,
  },
];

export const superAppApi = {
  async login(email: string): Promise<AuthSession> {
    await wait();
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: 'user-client-1',
        fullName: 'Cliente Demo',
        email,
        role: 'client',
      },
    };
  },

  async register(fullName: string, email: string): Promise<AuthSession> {
    await wait();
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: `user-${Date.now()}`,
        fullName,
        email,
        role: 'client',
      },
    };
  },

  async getCategories(): Promise<BusinessCategory[]> {
    return mockCategories;
  },

  async getBusinesses(): Promise<BusinessItem[]> {
    try {
      const response = await api.getConnectedBusinesses();
      const entries = Array.isArray(response?.data) ? response.data : [];

      return entries.map((business: any) => ({
        id: business.id,
        name: business.name,
        categoryId: business.category || 'cat-services',
        description: business.description || 'Negocio activo en OneD Hub',
        rating: Number(business.rating || 4.5),
        etaMinutes: Number(business.etaMinutes || 35),
        distanceKm: Number(business.distanceKm || 2),
        products: defaultProductsForBusiness(business.id),
      }));
    } catch (_) {
      // fallback local para desarrollo cuando backend no está disponible.
      return mockBusinesses;
    }
  },

  async createOrder(payload: {
    userId: string;
    businessId: string;
    items: Array<{ productId: string; name: string; quantity: number; unitPrice: number }>;
    notes?: string;
  }): Promise<Order> {
    const response = await api.createOrder(payload);
    return response.data;
  },

  async getMyOrders(userId: string): Promise<Order[]> {
    try {
      const response = await api.getMyOrders(userId);
      return Array.isArray(response?.data) ? response.data : [];
    } catch (_) {
      return mockOrders;
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await api.getOrderById(orderId);
      return response?.data || null;
    } catch (_) {
      return mockOrders.find((item) => item.id === orderId) || null;
    }
  },

  async getAddresses(): Promise<Address[]> {
    return mockAddresses;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return mockPaymentMethods;
  },
};
