import { useState } from 'react';
import { signup, logout } from '../utils/api';

export default function Signup({ switchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Create account only (NO auto-login)
      await signup({
        username: username.trim(),
        password,
        role: 'member'
      });

      // Redirect user to Login page
        // Clear any existing local session to avoid accidental auto-login
        try { logout(); } catch (e) { /* ignore */ }
        switchToLogin();

    } catch (err) {
      if (err.networkError) {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        setError(err.error || err.message || 'Signup failed. Username may already exist.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-wrapper">
      <div className="card card-auth">
        <div className="card-body p-4 p-md-5">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="auth-icon mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join our contact tracing system</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="auth-form">

            <div className="mb-4">
              <label className="form-label auth-label">Username</label>
              <input
                type="text"
                className="form-control auth-input"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                required
                minLength={3}
              />
            </div>

            <div className="mb-4">
              <label className="form-label auth-label">Password</label>
              <input
                type="password"
                className="form-control auth-input"
                placeholder="Choose a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="alert alert-danger auth-alert">
                {error}
              </div>
            )}

            <div className="d-grid mb-4">
              <button
                className="btn btn-primary btn-auth"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center">
              <p className="auth-switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={switchToLogin}
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </div>

          </form>

          {/* Security badge */}
          <div className="mt-4 pt-4 border-top text-center">
            <small className="text-muted">
              Secure authentication with bcrypt & JWT
            </small>
          </div>

        </div>
      </div>
    </div>
  );
}
