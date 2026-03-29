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
        products: [],
      }));
    } catch (_) {
      // Si backend no responde, usamos catálogo mock para desarrollo local.
    }

    return mockBusinesses;
  },

  async getAddresses(): Promise<Address[]> {
    return mockAddresses;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return mockPaymentMethods;
  },

  async getOrders(): Promise<Order[]> {
    return mockOrders;
  },
};
