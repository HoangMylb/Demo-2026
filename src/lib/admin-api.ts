import type { AdminProduct, AdminSession, AdminStats, AdminUser, ProductPayload, UserAccessPayload } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
const AUTH_STORAGE_KEY = 'luma-auth-token';

interface LoginResponse {
  token: string;
  email: string;
  userName: string;
  role: string;
}

interface RegisterResponse {
  token: string;
  email: string;
  userName: string;
  role: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = window.atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractClaim(payload: Record<string, unknown> | null, keys: string[]) {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
}

export function getStoredAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    if (!parsed.token) {
      return null;
    }

    const payload = decodeJwtPayload(parsed.token);

    return {
      token: parsed.token,
      role: extractClaim(payload, ['role', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role']),
      email: extractClaim(payload, ['email', 'unique_name', 'sub']),
    };
  } catch {
    return null;
  }
}

export function storeAdminSession(token: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token }));
  return getStoredAdminSession();
}

export function clearAdminSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
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
  return storeAdminSession(data.token);
}

export async function registerAdmin(fullName: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
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
  return storeAdminSession(data.token);
}

function getAuthHeaders() {
  const session = getStoredAdminSession();

  if (!session?.token) {
    return {} as Record<string, string>;
  }

  return { Authorization: `Bearer ${session.token}` };
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

  const authHeaders = getAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  return parseJsonResponse<T>(response);
}

async function requestWithoutJson(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  const authHeaders = getAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
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
