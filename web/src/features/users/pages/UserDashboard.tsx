import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { usersApi } from '../../../services/api';
import type { CreateUserInput, User, UserStatus } from '../../../types';

const filters: Array<{ label: string; value: UserStatus | 'all' }> = [
  { label: 'All users', value: 'all' },
  { label: 'Awaiting approval', value: 'pending_approval' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

const regionLabel: Record<string, string> = {
  'ap-south-1': 'India',
  'eu-central-1': 'Europe',
  'us-east-1': 'United States',
};

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function UserDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<UserStatus | 'all'>('pending_approval');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await usersApi.list(status, search);
      setUsers(page.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    visible: users.length,
    pending: users.filter((user) => user.status === 'pending_approval').length,
    verified: users.filter((user) => user.email_verified_at && user.phone_verified_at).length,
  }), [users]);

  async function act(action: 'approve' | 'reject' | 'suspend' | 'reactivate', user: User) {
    const reason = action === 'reject' || action === 'suspend'
      ? window.prompt(`Reason to ${action} ${user.display_name}:`)
      : undefined;
    if ((action === 'reject' || action === 'suspend') && !reason) return;
    setError('');
    try {
      if (action === 'approve') await usersApi.approve(user.public_id);
      if (action === 'reject') await usersApi.reject(user.public_id, reason!);
      if (action === 'suspend') await usersApi.suspend(user.public_id, reason!);
      if (action === 'reactivate') await usersApi.reactivate(user.public_id);
      setNotice(`${user.display_name} was ${action === 'reactivate' ? 'reactivated' : `${action}d`}.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Action failed');
    }
  }

  async function createUser(input: CreateUserInput) {
    await usersApi.create(input);
    setShowCreate(false);
    setNotice('User created. Email and mobile verification are now required.');
    await load();
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="AI-LMS home"><span>AI</span><strong>LMS</strong></a>
      <nav aria-label="Primary navigation">
        <a href="#overview">Overview</a>
        <a className="active" href="#users">User approvals <b>{counts.pending}</b></a>
        <a href="#institutions">Institutions</a>
        <a href="#activity">Audit activity</a>
      </nav>
      <div className="security-note"><strong>Four-eyes security</strong><p>Privileged accounts require approval by another authorized administrator.</p></div>
    </aside>

    <main id="top">
      <header className="topbar"><div><span className="eyebrow">Platform control</span><h1>User approvals</h1></div><button className="primary" onClick={() => setShowCreate(true)}>+ Create user</button></header>

      <section className="summary-grid" id="overview" aria-label="User summary">
        <article><span>Visible users</span><strong>{counts.visible}</strong><small>Current filtered result</small></article>
        <article><span>Awaiting decision</span><strong>{counts.pending}</strong><small>Requires administrator review</small></article>
        <article><span>Fully verified</span><strong>{counts.verified}</strong><small>Email and mobile confirmed</small></article>
      </section>

      {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
      {error && <div className="error" role="alert">{error}</div>}

      <section className="panel" id="users">
        <div className="toolbar">
          <div className="tabs" role="tablist" aria-label="User status">
            {filters.map((filter) => <button role="tab" aria-selected={status === filter.value} className={status === filter.value ? 'selected' : ''} key={filter.value} onClick={() => setStatus(filter.value)}>{filter.label}</button>)}
          </div>
          <label className="search"><span>Search users</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email or mobile" /></label>
        </div>

        {loading ? <div className="empty">Loading users…</div> : users.length === 0 ? <div className="empty"><strong>No users found</strong><span>Try a different filter or create a user.</span></div> : <div className="user-list">
          {users.map((user) => <article className="user-row" key={user.public_id}>
            <div className="avatar" aria-hidden="true">{initials(user.display_name)}</div>
            <div className="identity"><strong>{user.display_name}</strong><span>{user.email_masked} · {user.phone_masked}</span></div>
            <div className="meta"><span>{regionLabel[user.identity_region] ?? user.identity_region}</span><small>Via {user.registered_via.replace('_', ' ')}</small></div>
            <span className={`status status-${user.status}`}>{user.status.replaceAll('_', ' ')}</span>
            <div className="actions">
              {user.status === 'pending_approval' && <><button className="approve" onClick={() => void act('approve', user)}>Approve</button><button onClick={() => void act('reject', user)}>Reject</button></>}
              {user.status === 'active' && <button onClick={() => void act('suspend', user)}>Suspend</button>}
              {user.status === 'suspended' && <button className="approve" onClick={() => void act('reactivate', user)}>Reactivate</button>}
            </div>
          </article>)}
        </div>}
      </section>
    </main>
    {showCreate && <CreateUserDialog onClose={() => setShowCreate(false)} onCreate={createUser} />}
  </div>;
}

function CreateUserDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (input: CreateUserInput) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      await onCreate({ first_name: String(data.get('first_name')), last_name: String(data.get('last_name')), email: String(data.get('email')), phone: String(data.get('phone')), identity_region: String(data.get('identity_region')) });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create user'); setSaving(false); }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-head"><div><span className="eyebrow">New account</span><h2 id="create-title">Create user</h2></div><button aria-label="Close" onClick={onClose}>×</button></div><p>The user must verify both email and mobile before approval.</p>{error && <div className="error" role="alert">{error}</div>}<form onSubmit={submit}><div className="form-grid"><label>First name<input required name="first_name" autoFocus /></label><label>Last name<input name="last_name" /></label></div><label>Email address<input required name="email" type="email" /></label><label>Mobile in E.164 format<input required name="phone" type="tel" pattern="\+[1-9][0-9]{7,14}" placeholder="+919876543210" /></label><label>Identity region<select name="identity_region" defaultValue="ap-south-1"><option value="ap-south-1">India</option><option value="eu-central-1">Europe</option><option value="us-east-1">United States</option></select></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary" disabled={saving}>{saving ? 'Creating…' : 'Create and verify'}</button></div></form></section></div>;
}
