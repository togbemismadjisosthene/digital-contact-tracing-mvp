import './App.css';
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard';
import { getCurrentUser, logout as apiLogout, getNotifications, markNotificationRead } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // kept for some internal toggles
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready'
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const u = await getCurrentUser();
        if (u) {
          setUser(u);
          // fetch notifications for this user (if any)
          try {
            const notifs = await getNotifications();
            if (Array.isArray(notifs)) setNotifications(notifs.filter(n => !n.read));
          } catch (e) {
            // ignore notification fetch errors for now
            console.debug('Could not fetch notifications', e);
          }
          // redirect to dashboard route
          const dashboardPath = u.role === 'admin' ? '/admin/dashboard' : '/member';
          navigate(dashboardPath, { replace: true });
        } else {
          // remain on home
          navigate('/', { replace: true });
        }
      } finally {
        setStatus('ready');
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After login/logout navigate appropriately

  function handleLogin(nextUser) {
    if (!nextUser || !nextUser.role) {
      console.error('Invalid user data received');
      return;
    }
    setUser(nextUser);
    // fetch notifications for this user after login
    (async () => {
      try {
        const notifs = await getNotifications();
        if (Array.isArray(notifs)) setNotifications(notifs.filter(n => !n.read));
      } catch (e) {
        console.debug('Could not fetch notifications after login', e);
      }
    })();
    const nextPath = nextUser.role === 'admin' ? '/admin/dashboard' : '/member';
    navigate(nextPath, { replace: true });
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setNotifications([]);
    navigate('/', { replace: true });
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.filter(n => n.id !== Number(id)));
    } catch (e) {
      console.error('Mark read failed', e);
    }
  }

  const isAuthed = Boolean(user);
  const isAdmin = isAuthed && user.role === 'admin';

  return (
    <div className="App">
      <header className="topbar">
        <div className="App-container topbar-inner">
          <div className="brand">
            <span className="brand-mark">CT</span>
            <div>
              <div className="brand-title">Contact Tracing Demo</div>
              <div className="brand-subtitle">Privacy-first, form-based workflow</div>
            </div>
          </div>
            <div className="topbar-actions">
            {isAuthed ? (
              <>
                <span className="badge bg-light text-dark me-2">{user.username} ({user.role})</span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <div className="btn-group">
                <button className="btn btn-light btn-sm" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/signup')}>Sign up</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isAuthed && notifications && notifications.length > 0 && (
        <div className="App-container mt-2">
          {notifications.map(n => (
            <div key={n.id} className="alert alert-warning alert-dismissible d-flex justify-content-between align-items-start" role="alert">
              <div>
                <strong>Exposure notification (simulation)</strong>
                <div className="small">{n.message || 'You may have had recent exposure. Follow public health guidance.'}</div>
              </div>
              <div className="ms-3">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleMarkRead(n.id)}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <main className="page">
        {status === 'loading' && (
          <section className="auth-page">
            <div className="auth-container">
              <div className="card card-auth text-center">
                <div className="card-body">
                  <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                  <p className="mt-3 mb-0">Checking your session…</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <Routes>
          <Route path="/" element={
            !isAuthed ? (
              <section className="home-page">
                <div className="home-container">
                  <div className="home-content">
                    <div className="app-logo">{/* ...existing svg... */}
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM19 11L15 15L13 13L11 15L15 19L23 11L19 11Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <h1 className="app-name">Contact Tracing</h1>
                    <p className="app-tagline">Privacy-first, form-based contact tracing system</p>
                    <div className="home-buttons">
                      <button className="btn btn-home btn-home-primary" onClick={() => navigate('/login')}>Login</button>
                      <button className="btn btn-home btn-home-secondary" onClick={() => navigate('/signup')}>Sign Up</button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <Navigate to={isAdmin ? '/admin' : '/member'} replace />
            )
          } />

          <Route path="/login" element={!isAuthed ? <div className="auth-page"><div className="auth-container"><Login onLogin={handleLogin} switchToSignup={() => navigate('/signup')} /></div></div> : <Navigate to={isAdmin ? '/admin' : '/member'} replace />} />

          <Route path="/signup" element={!isAuthed ? <div className="auth-page"><div className="auth-container"><Signup onSignup={handleLogin} switchToLogin={() => navigate('/login')} /></div></div> : <Navigate to={isAdmin ? '/admin' : '/member'} replace />} />

          <Route path="/member" element={isAuthed ? (isAdmin ? <Navigate to="/admin/dashboard" replace /> : <section className="App-container dashboard"><div className="card card-custom"><div className="card-body"><MemberDashboard currentUser={user} /></div></div></section>) : <Navigate to="/login" replace />} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={isAuthed ? (isAdmin ? <section className="App-container dashboard"><div className="card card-custom"><div className="card-body"><AdminDashboard currentUser={user} /></div></div></section> : <div className="alert alert-warning"><strong>Access Denied:</strong> Admins only.</div>) : <Navigate to="/login" replace />} />

        </Routes>
      </main>

      <footer className="site-footer text-center">
        © 2025 Digital Contact Tracing App — Academic Project 5. All rights reserved. For academic and educational use only.
      </footer>
    </div>
  );
}

export default App;
