import type { AdminOrder, AdminOrderStatus, AdminProduct, AdminReview, AdminSession, AdminStats, AdminUser, CreateAdminUserPayload, ProductPayload, Profile, ProfileUpdatePayload, UserAccessPayload } from '../types/admin';
import { getApiBaseUrl } from './api-base-url';

const API_BASE_URL = getApiBaseUrl();

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}


export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface ApiResult<T> {
  data: T;
  message: string;
}

interface LoginResponse {
  email: string;
  userName: string;
  role: string;
}

interface RegisterResponse {
  email: string;
  userName: string;
  role: string;
}

interface AuthProviderAvailability {
  google: boolean;
  facebook: boolean;
}

export function getStoredAdminSession(): AdminSession | null {
  return null;
}

function mapSession(data: LoginResponse): AdminSession {
  return {
    isAuthenticated: true,
    role: data.role,
    email: data.email,
    userName: data.userName,
  };
}

export function clearAdminSession() {
  return undefined;
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid email or password.');
    }

    if (response.status === 403) {
      throw new Error('This account is locked or forbidden.');
    }

    throw new Error(`Login failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiEnvelope<LoginResponse>;
  return mapSession(payload.data);
}

export async function registerAdmin(fullName: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email, password }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? 'This account already exists.');
    }

    throw new Error(`Register failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiEnvelope<RegisterResponse>;
  return mapSession(payload.data);
}

export async function getAuthProviderAvailability(): Promise<AuthProviderAvailability> {
  const response = await fetch(`${API_BASE_URL}/api/auth/providers`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Auth provider request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiEnvelope<AuthProviderAvailability>;
  return payload.data;
}

async function getSessionResponse() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Session request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiEnvelope<LoginResponse>;
  return mapSession(payload.data);
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResult<T>> {
  const payload = (await response.json()) as ApiEnvelope<T> | { message?: string };

  if (response.status === 401) {
    throw new ApiRequestError(payload.message ?? '401 Unauthorized - provide a valid JWT before accessing admin APIs.', 401);
  }

  if (response.status === 403) {
    throw new ApiRequestError(payload.message ?? '403 Forbidden - admin role required.', 403);
  }

  if (!response.ok) {
    throw new ApiRequestError(payload.message ?? `Request failed with status ${response.status}.`, response.status);
  }

  const successPayload = payload as ApiEnvelope<T>;
  return { data: successPayload.data, message: successPayload.message };
}

async function parseVoidResponse(response: Response): Promise<{ message: string }> {
  const payload = response.status === 204 ? null : ((await response.json()) as ApiEnvelope<null> | { message?: string });

  if (response.status === 401) {
    throw new ApiRequestError(payload?.message ?? '401 Unauthorized - provide a valid JWT before accessing admin APIs.', 401);
  }

  if (response.status === 403) {
    throw new ApiRequestError(payload?.message ?? '403 Forbidden - admin role required.', 403);
  }

  if (!response.ok) {
    throw new ApiRequestError(payload?.message ?? `Request failed with status ${response.status}.`, response.status);
  }

  return { message: payload?.message ?? 'Request completed successfully' };
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  return parseJsonResponse<T>(response);
}

async function requestWithoutJson(path: string, init?: RequestInit): Promise<{ message: string }> {
  const headers = new Headers(init?.headers);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  return parseVoidResponse(response);
}

export async function getAdminStats(): Promise<AdminStats> {
  return (await request<AdminStats>('/api/admin/dashboard/stats')).data;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return (await request<AdminProduct[]>('/api/admin/products')).data;
}

export async function createAdminProduct(payload: ProductPayload): Promise<ApiResult<AdminProduct>> {
  return request<AdminProduct>('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdminProduct(id: number, payload: ProductPayload): Promise<ApiResult<AdminProduct>> {
  return request<AdminProduct>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteAdminProduct(id: number): Promise<{ message: string }> {
  return requestWithoutJson(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return (await request<AdminUser[]>('/api/admin/users')).data;
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  return (await request<AdminReview[]>('/api/admin/reviews')).data;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return (await request<AdminOrder[]>('/api/admin/orders')).data;
}

export async function updateAdminOrderStatus(id: number, status: AdminOrderStatus): Promise<ApiResult<AdminOrder>> {
  return request<AdminOrder>(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function deleteAdminOrder(id: number): Promise<{ message: string }> {
  return requestWithoutJson(`/api/admin/orders/${id}`, { method: 'DELETE' });
}

export async function deleteAdminReview(id: number): Promise<{ message: string }> {
  return requestWithoutJson(`/api/admin/reviews/${id}`, { method: 'DELETE' });
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<ApiResult<AdminUser>> {
  return request<AdminUser>('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdminUserAccess(id: number, payload: UserAccessPayload): Promise<ApiResult<AdminUser>> {
  return request<AdminUser>(`/api/admin/users/${id}/access`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAdminUser(id: number): Promise<{ message: string }> {
  return requestWithoutJson(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function getProfile(): Promise<Profile> {
  return (await request<Profile>('/api/profile')).data;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<ApiResult<Profile>> {
  return request<Profile>('/api/profile', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getCurrentSession(): Promise<AdminSession | null> {
  return getSessionResponse();
}

export async function logoutAdmin(): Promise<void> {
  await requestWithoutJson('/api/auth/logout', { method: 'POST' });
}
