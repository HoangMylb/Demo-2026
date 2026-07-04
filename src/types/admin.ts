export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
}

export interface AdminCategoryOption {
  id: number;
  name: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  isLocked: boolean;
  isApproved: boolean;
  createdAtUtc: string;
}

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  categoryName: string;
  userId: number;
  customerName: string;
  rating: number;
  comment: string;
  variantType: string;
  color: string;
  size: string;
  helpfulCount: number;
  purchasedAtUtc: string;
  createdAtUtc: string;
}

export interface UserAccessPayload {
  fullName?: string;
  userName?: string;
  email?: string;
  role?: 'Admin' | 'User';
  isLocked?: boolean;
  isApproved?: boolean;
}

export interface CreateAdminUserPayload {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  role: 'Admin' | 'User';
}

export interface Profile {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  isLocked: boolean;
  isApproved: boolean;
  createdAtUtc: string;
}

export interface ProfileUpdatePayload {
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  shippingAddress: string;
  status: string;
  paymentStatus: string;
  currency: string;
  totalAmount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
  items: AdminOrderItem[];
}

export type AdminOrderStatus = 'Order' | 'Processing' | 'Shipping' | 'Delivered' | 'Cancelled';

export interface AdminSession {
  isAuthenticated: boolean;
  role: string | null;
  email: string | null;
  userName: string | null;
}
