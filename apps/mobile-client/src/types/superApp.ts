export type UserRole = 'client' | 'business' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export type BusinessType = 'cafeteria' | 'ferreteria' | 'supermercado' | 'colmado' | 'barberia_salon';

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ProductItem {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
}

export interface BusinessItem {
  id: string;
  name: string;
  categoryId: string;
  businessType: BusinessType;
  description: string;
  rating: number;
  etaMinutes: number;
  distanceKm: number;
  bannerUrl?: string;
  products: ProductItem[];
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  type: 'cash' | 'card' | 'wallet';
}

export interface Order {
  id: string;
  businessId: string;
  businessName: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  status: OrderStatus;
  createdAt: string;
  address: Address;
  paymentMethod: PaymentMethod;
}
