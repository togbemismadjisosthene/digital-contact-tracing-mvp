import { useState } from 'react';
import { login } from '../utils/api';

export default function Login({ onLogin, switchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ username: username.trim(), password });
      onLogin(data.user);
    } catch (err) {
      if (err.networkError) {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        setError(err.error || err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-wrapper">
      <div className="card card-auth">
        <div className="card-body p-4 p-md-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="auth-icon mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM19 11L15 15L13 13L11 15L15 19L23 11L19 11Z" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="auth-form">
            <div className="mb-4">
              <label className="form-label auth-label">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                Username
              </label>
              <input 
                placeholder="Enter your username" 
                autoFocus 
                className="form-control auth-input" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label auth-label">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 3C13.66 3 15 4.34 15 6V8H9V6C9 4.34 10.34 3 12 3ZM18 20H6V10H18V20Z" fill="currentColor"/>
                </svg>
                Password
              </label>
              <input 
                placeholder="Enter your password" 
                className="form-control auth-input" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            {error && (
              <div className="alert alert-danger auth-alert" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}

            <div className="d-grid gap-2 mb-4">
              <button className="btn btn-primary btn-auth" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ms-2">
                      <path d="M13 7L18 12L13 17V7Z" fill="currentColor"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="auth-switch-text mb-0">
                Don't have an account?{' '}
                <button type="button" className="btn-link" onClick={switchToSignup} disabled={loading}>
                  Create account
                </button>
              </p>
            </div>
          </form>

          {/* Security badge */}
          <div className="mt-4 pt-4 border-top text-center">
            <small className="text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-1" style={{verticalAlign: 'text-bottom'}}>
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.6 14.8 10V11H16.5V16.5H7.5V11H9.2V10C9.2 8.6 10.6 7 12 7ZM12 8.2C11.2 8.2 10.5 8.7 10.5 9.5V11H13.5V9.5C13.5 8.7 12.8 8.2 12 8.2Z" fill="currentColor"/>
              </svg>
              Secure authentication with JWT tokens
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
