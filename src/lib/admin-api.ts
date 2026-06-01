import type { AdminProduct, AdminSession, AdminStats, AdminUser, ProductPayload, Profile, ProfileUpdatePayload, UserAccessPayload } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://hoangmydemo-api.onrender.com';

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

  const data = (await response.json()) as LoginResponse;
  return mapSession(data);
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

  const data = (await response.json()) as RegisterResponse;
  return mapSession(data);
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

  const data = (await response.json()) as LoginResponse;
  return mapSession(data);
}

async function parseJsonResponse<T>(response: Response) {
  if (response.status === 401) {
    throw new Error('401 Unauthorized - provide a valid JWT before accessing admin APIs.');
  }

  if (response.status === 403) {
    throw new Error('403 Forbidden - admin role required.');
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function parseVoidResponse(response: Response) {
  if (response.status === 401) {
    throw new Error('401 Unauthorized - provide a valid JWT before accessing admin APIs.');
  }

  if (response.status === 403) {
    throw new Error('403 Forbidden - admin role required.');
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }
}

async function request<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  return parseJsonResponse<T>(response);
}

async function requestWithoutJson(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  return parseVoidResponse(response);
}

export async function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>('/api/admin/dashboard/stats');
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return request<AdminProduct[]>('/api/admin/products');
}

export async function createAdminProduct(payload: ProductPayload): Promise<AdminProduct> {
  return request<AdminProduct>('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAdminProduct(id: number, payload: ProductPayload): Promise<AdminProduct> {
  return request<AdminProduct>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteAdminProduct(id: number): Promise<void> {
  await requestWithoutJson(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>('/api/admin/users');
}

export async function updateAdminUserAccess(id: number, payload: UserAccessPayload): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}/access`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteAdminUser(id: number): Promise<void> {
  await requestWithoutJson(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function getProfile(): Promise<Profile> {
  return request<Profile>('/api/profile');
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
  return request<Profile>('/api/profile', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function getCurrentSession(): Promise<AdminSession | null> {
  return getSessionResponse();
}

export async function logoutAdmin(): Promise<void> {
  await requestWithoutJson('/api/auth/logout', { method: 'POST' });
}
