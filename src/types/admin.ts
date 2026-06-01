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

export interface UserAccessPayload {
  fullName?: string;
  userName?: string;
  email?: string;
  role?: 'Admin' | 'User';
  isLocked?: boolean;
  isApproved?: boolean;
}

export interface Profile {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  isLocked: boolean;
  isApproved: boolean;
  createdAtUtc: string;
}

export interface ProfileUpdatePayload {
  fullName: string;
  userName: string;
  email: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  role: string | null;
  email: string | null;
  userName: string | null;
}
