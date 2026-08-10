import { FormEvent, useState } from 'react';
import { authApi } from './api';
import { UserDashboard } from './UserDashboard';
import { TenantApprovals } from './TenantApprovals';
import { TenantRegistrationPage } from './TenantRegistrationPage';
import { AuthPage } from './AuthPages';
import { RoleDashboard } from './Dashboards';

export function App() {
  const path=window.location.pathname;
  if(path==='/tenant-register')return <TenantRegistrationPage/>;
  if(path==='/signup')return <AuthPage mode="signup"/>;
  if(path==='/signin')return <AuthPage mode="signin"/>;
  if(path==='/forgot-password')return <AuthPage mode="forgot"/>;
  if(path==='/reset-password')return <AuthPage mode="reset"/>;
  if(path==='/change-password')return <AuthPage mode="change"/>;
  if(path==='/super-admin')return <RoleDashboard role="super"/>;
  if(path==='/admin')return <RoleDashboard role="admin"/>;
  if(path==='/tenant')return <RoleDashboard role="tenant"/>;
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem('ai_lms_token')));
  return authenticated ? (new URLSearchParams(window.location.search).get('view')==='tenants'?<TenantApprovals/>:<UserDashboard />) : <Login onAuthenticated={() => setAuthenticated(true)} />;
}

function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await authApi.login(String(data.get('email')), String(data.get('password')));
      localStorage.setItem('ai_lms_token', response.token); onAuthenticated();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Sign in failed'); setLoading(false); }
  }
  return <main className="login-page"><section className="login-card"><div className="brand login-brand"><span>AI</span><strong>LMS</strong></div><span className="eyebrow">Platform administration</span><h1>Welcome back</h1><p>Sign in with an approved super-administrator account.</p>{error && <div className="error" role="alert">{error}</div>}<form onSubmit={submit}><label>Email address<input name="email" type="email" required autoFocus /></label><label>Password<input name="password" type="password" required /></label><button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'}</button></form><small>Privileged accounts require verified email, verified mobile and MFA.</small></section></main>;
}
