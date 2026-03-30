import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
// Para producción: 'https://tu-api-render.com/api'

const mapIds = (payload: any): any => {
  if (Array.isArray(payload)) {
    return payload.map(mapIds);
  }

  if (payload && typeof payload === 'object') {
    const mapped: Record<string, any> = {};

    Object.keys(payload).forEach((key) => {
      mapped[key] = mapIds(payload[key]);
    });

    if (mapped._id && !mapped.id) {
      mapped.id = mapped._id;
    }

    return mapped;
  }

  return payload;
};

class ApiClient {
  private baseUrl: string;
  private socket: any;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  private async request(endpoint: string, options: any = {}) {
    const token = await this.getToken();
    const method = String(options.method || 'GET').toUpperCase();
    const cacheKey = `backup:${endpoint}`;
    
    const config = {
      ...options,
      signal: options.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    if (!config.signal) {
      config.signal = controller.signal;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = mapIds(await response.json());

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      if (method === 'GET' && endpoint !== '/auth/login') {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      }

      return data;
    } catch (error: any) {
      if (method === 'GET') {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      if (String(error?.message || '').toLowerCase().includes('token inválido')) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }

      console.error('API Error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Auth
  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async bootstrapAdmin(payload: {
  username: string;
  email: string;
  name: string;
  password: string;
}) {
  return this.request('/auth/bootstrap-admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

  async registerUser(payload: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'manager' | 'cashier';
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Ingredients
  async getIngredients() {
    return this.request('/ingredients');
  }

  async createIngredient(ingredient: any) {
    return this.request('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
  }

  async restockIngredient(id: string, quantity: number, reason?: string) {
    return this.request(`/ingredients/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason }),
    });
  }
  async deleteIngredient(id: string) {
  return this.request(`/ingredients/${id}`, {
    method: 'DELETE',
  });
}

async adjustStock(id: string, newStock: number, reason: string) {
  return this.request(`/ingredients/${id}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ newStock, reason }),
  });
}

async deductIngredients(recipeId: string, quantity: number, saleId: string) {
  return this.request('/ingredients/deduct', {
    method: 'POST',
    body: JSON.stringify({ recipeId, quantity, saleId }),
  });
}


  async getConnectedBusinesses() {
    return this.request('/v1/businesses/connected');
  }

  async getBusinessProducts(businessId: string) {
    return this.request(`/v1/businesses/${businessId}/products`);
  }

  async getPosts(params?: { category?: string; businessId?: string; includeInactive?: boolean }) {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.businessId) search.set('businessId', params.businessId);
    if (params?.includeInactive !== undefined) search.set('includeInactive', String(params.includeInactive));
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return this.request(`/v1/posts${suffix}`);
  }

  async getPostsByCategory(category: string) {
    return this.request(`/v1/posts/category/${encodeURIComponent(category)}`);
  }

  async createPost(payload: {
    businessId: string;
    title: string;
    content: string;
    imageUrl?: string;
    tags?: string[];
  }) {
    return this.request('/v1/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, payload: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }


  async createOrder(payload: {
    userId: string;
    businessId: string;
    items: Array<{ productId: string; name: string; quantity: number; unitPrice: number }>;
    notes?: string;
  }) {
    return this.request('/v1/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyOrders(userId: string) {
    return this.request(`/v1/orders/my-orders?userId=${encodeURIComponent(userId)}`);
  }

  async getOrderById(orderId: string) {
    return this.request(`/v1/orders/${orderId}`);
  }

  async getBusinessOrders(businessId: string) {
    return this.request(`/v1/orders/business/${businessId}`);
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'cancelled') {
    return this.request(`/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Sales
  async createSale(saleData: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  // Customers
  async getCustomers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/customers${query}`);
  }

  async createCustomer(payload: {
    customerId?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCustomerHistory(customerMongoId: string) {
    return this.request(`/customers/${customerMongoId}/history`);
  }

  async updateCustomer(customerMongoId: string, payload: {
    customerId?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
  }) {
    return this.request(`/customers/${customerMongoId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteCustomer(customerMongoId: string) {
    return this.request(`/customers/${customerMongoId}`, {
      method: 'DELETE',
    });
  }

  async getSales(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/sales${queryString}`);
  }

  async getDashboardStats() {
    return this.request('/sales/dashboard/stats');
  }

  // Notifications / Pedidos externos
  async getNotifications(params?: { status?: string; unreadOnly?: boolean }) {
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
            if (v !== undefined && v !== null) acc[k] = String(v);
            return acc;
          }, {})
        )}`
      : '';
    return this.request(`/notifications${queryString}`);
  }

  async createNotification(payload: {
    type?: 'delivery_order' | 'system' | 'inventory';
    title?: string;
    message?: string;
    orderNumber?: string;
    driverName?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    source?: string;
    metadata?: any;
  }) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateNotification(notificationId: string, payload: {
    status?: 'new' | 'in_progress' | 'completed' | 'cancelled';
    isRead?: boolean;
    isActive?: boolean;
  }) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Reports BI
  async getReportKpis(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/kpis${queryString}`);
  }

  async getSalesHeatmap(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/sales/heatmap${queryString}`);
  }

  async getProductProfitability(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/products/profitability${queryString}`);
  }

  async getInventoryConsumptionReport(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/inventory/consumption${queryString}`);
  }

  async getExpenses(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/reports/expenses${queryString}`);
  }

  async createExpense(payload: {
    date?: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
    reference?: string;
  }) {
    return this.request('/reports/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateExpense(expenseId: string, payload: {
    date?: string;
    category?: string;
    description?: string;
    amount?: number;
    paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
    reference?: string;
    isActive?: boolean;
  }) {
    return this.request(`/reports/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteExpense(expenseId: string) {
    return this.request(`/reports/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  async warmupOfflineBackup() {
    await Promise.allSettled([
      this.getIngredients(),
      this.getProducts(),
      this.getCustomers(),
      this.getNotifications({ unreadOnly: true }),
      this.getSales({ limit: '200' }),
      this.getDashboardStats(),
    ]);
  }
}


export const api = new ApiClient(API_URL);
export default api;
