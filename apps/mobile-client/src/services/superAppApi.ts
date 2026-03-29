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
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        return mockBusinesses;
      }
    } catch (_) {
      // Backend aún no expone endpoints de negocio para cliente final.
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
