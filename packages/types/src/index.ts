export type UserRole =
  | 'client'
  | 'business'
  | 'driver'
  | 'marketplace_seller'
  | 'admin';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  role: UserRole;
}

export interface AppUser extends BaseEntity {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}

export interface Business extends BaseEntity {
  ownerUserId?: string;
  name: string;
  slug?: string;
  type?: 'cafe' | 'colmado' | 'ferreteria' | 'barberia' | 'salon' | 'nails_studio' | 'supermercado' | 'general';
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
  enabledModules?: string[];
  description?: string;
  isOpen?: boolean;
  isActive?: boolean;
}

export interface Product extends BaseEntity {
  businessId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  sku?: string;
  stock?: number;
  minStock?: number;
  businessType?: string;
  currency?: 'USD' | 'MXN' | 'COP' | 'ARS';
  isAvailable?: boolean;
  isActive?: boolean;
}

export interface InventoryItem extends BaseEntity {
  businessId: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  type?: string;
}

export interface Sale extends BaseEntity {
  businessId: string;
  cashierUserId: string;
  items: Array<{ productId: string; name?: string; quantity: number; price: number; total?: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed';
  customerId?: string;
  source?: 'local_pos' | 'future_marketplace';
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface Order extends BaseEntity {
  customerUserId: string;
  businessId: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  status: OrderStatus;
  total: number;
}

export interface DeliveryTask extends BaseEntity {
  orderId: string;
  driverUserId?: string;
  status: 'available' | 'assigned' | 'picked_up' | 'completed' | 'failed';
  currentLat?: number;
  currentLng?: number;
}
