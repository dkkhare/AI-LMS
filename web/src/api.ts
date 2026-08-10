import type { CreateUserInput, Page, User, UserStatus } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ai_lms_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message ?? 'Request failed', response.status);
  }

  return response.json() as Promise<T>;
}

export const usersApi = {
  list: (status: UserStatus | 'all', search: string) =>
    request<Page<User>>(`/admin/users?status=${status}&search=${encodeURIComponent(search)}`),
  create: (input: CreateUserInput) =>
    request<{ data: User }>('/admin/users', { method: 'POST', body: JSON.stringify(input) }),
  approve: (id: string, comment?: string) =>
    request<{ data: User }>(`/admin/users/${id}/approve`, { method: 'POST', body: JSON.stringify({ comment }) }),
  reject: (id: string, reason: string) =>
    request<{ data: User }>(`/admin/users/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  suspend: (id: string, reason: string) =>
    request<{ data: User }>(`/admin/users/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),
  reactivate: (id: string) =>
    request<{ data: User }>(`/admin/users/${id}/reactivate`, { method: 'POST' }),
};

export const authApi = {
  login: (email: string, password: string) => request<{ token: string; user: User }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
};
