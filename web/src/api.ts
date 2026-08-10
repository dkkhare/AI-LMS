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

export interface TenantRegistration { public_id:string; institution_name:string; legal_name?:string; requested_slug:string; constitution_type:string; home_region:string; country_code:string; status:string; submitted_at:string|null; applicant:{display_name:string;email_masked:string;phone_masked:string}; tax_identifiers:Array<{identifier_type:string;masked_value:string;verification_status:string}>; }
export const tenantApi={
 register:(input:unknown)=>request<{data:{request_id:string;verification_token:string;status:string}}>('/tenant-registrations',{method:'POST',body:JSON.stringify(input)}),
 verify:(id:string,verification_token:string,channel:'email'|'sms',otp:string)=>request<{data:{status:string}}>(`/tenant-registrations/${id}/verify`,{method:'POST',body:JSON.stringify({verification_token,channel,otp})}),
 list:()=>request<Page<TenantRegistration>>('/admin/tenant-registrations?status=submitted'),
 approve:(id:string)=>request(`/admin/tenant-registrations/${id}/approve`,{method:'POST'}),
 reject:(id:string,reason:string)=>request(`/admin/tenant-registrations/${id}/reject`,{method:'POST',body:JSON.stringify({reason})}),
};
