import React, { useState } from 'react';
import './LoginPage.css';

export default function LoginPage({ onLogin, onBack }) {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      onLogin(data.user, data.token);
    } catch { setError('Server error. Please try again.'); setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please enter credentials'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'banned') setError(`Account banned. Reason: ${data.reason}`);
        else setError(data.error || 'Login failed');
        setLoading(false); return;
      }
      onLogin(data.user, data.token);
    } catch { setError('Server error. Please try again.'); setLoading(false); }
  };

  return (
    <div className="login-bg">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <button className="login-back btn btn-ghost btn-sm" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Back
      </button>

      <div className="login-container animate-fade-up">
        <div className="login-header">
          <div className="login-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#c8a96e" strokeWidth="1"/>
              <circle cx="14" cy="14" r="6" stroke="#c8a96e" strokeWidth="1" opacity="0.5"/>
              <circle cx="14" cy="14" r="2" fill="#c8a96e"/>
            </svg>
          </div>
          <h1 className="login-title">Art Therapy</h1>
          <p className="login-sub">Your mindful creative space</p>
        </div>

        <div className="login-tabs">
          <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>New here</button>
          <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label className="label">First name</label>
                <input className="input-field" placeholder="Jane" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Last name</label>
                <input className="input-field" placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Email address</label>
              <input className="input-field" type="email" placeholder="jane@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : 'Begin your journey →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="label">Username / Email</label>
              <input className="input-field" placeholder="your@email.com or Admin" value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        )}

        <p className="login-hint">
          {mode === 'register' ? 'Already have an account? ' : 'First time? '}
          <button className="link-btn" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>
            {mode === 'register' ? 'Sign in' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}
