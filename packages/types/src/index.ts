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
  ownerUserId: string;
  name: string;
  description?: string;
  isOpen: boolean;
}

export interface Product extends BaseEntity {
  businessId: string;
  name: string;
  price: number;
  currency: 'USD' | 'MXN' | 'COP' | 'ARS';
  isAvailable: boolean;
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
