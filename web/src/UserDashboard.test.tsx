import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDashboard } from './UserDashboard';

const pending = { public_id:'01TEST', display_name:'Anita Rao', email_masked:'a***@example.com', phone_masked:'+91 ******1234', identity_region:'ap-south-1', registered_via:'self', status:'pending_approval', email_verified_at:'2026-08-10', phone_verified_at:'2026-08-10', created_at:'2026-08-10' };

describe('UserDashboard', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok:true, json:async()=>({ data:[pending], meta:{current_page:1,last_page:1,total:1} }) })); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it('shows verified users awaiting approval', async () => { render(<UserDashboard />); expect(await screen.findByText('Anita Rao')).toBeInTheDocument(); expect(screen.getByRole('button',{name:'Approve'})).toBeInTheDocument(); });
  it('opens the create-user form', async () => { render(<UserDashboard />); await screen.findByText('Anita Rao'); await userEvent.click(screen.getByRole('button',{name:/create user/i})); expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(screen.getByLabelText('Email address')).toBeRequired(); });
  it('approves a pending user and reloads', async () => { render(<UserDashboard />); await userEvent.click(await screen.findByRole('button',{name:'Approve'})); await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/01TEST/approve'), expect.objectContaining({method:'POST'}))); });
});
