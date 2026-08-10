import { FormEvent, useState } from 'react';
import { authApi } from './api';
import { UserDashboard } from './UserDashboard';

export function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem('ai_lms_token')));
  return authenticated ? <UserDashboard /> : <Login onAuthenticated={() => setAuthenticated(true)} />;
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
