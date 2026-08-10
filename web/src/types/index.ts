export type UserStatus =
  | 'pending_verification'
  | 'pending_approval'
  | 'pending_activation'
  | 'active'
  | 'locked'
  | 'suspended'
  | 'disabled'
  | 'archived';

export interface User {
  public_id: string;
  display_name: string;
  email_masked: string;
  phone_masked: string;
  identity_region: string;
  registered_via: string;
  status: UserStatus;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
}

export interface Page<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface CreateUserInput {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  identity_region: string;
}
