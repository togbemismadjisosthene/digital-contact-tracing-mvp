import { useState } from 'react';
import InteractionForm from './InteractionForm';

export default function MemberDashboard({ currentUser }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  const handleInteractionSaved = () => {
    // Show success feedback without displaying interaction details
    setShowSuccess(true);
    setSaveCount(prev => prev + 1);
    
    // Auto-hide after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="dashboard-content">
      {/* Success Toast */}
      {showSuccess && (
        <div 
          className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg"
          style={{ zIndex: 1050, minWidth: '300px' }}
          role="alert"
          aria-live="polite"
        >
          <div className="d-flex align-items-center">
            <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <strong>Interaction recorded successfully!</strong>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="mb-1 dashboard-title h2">Member Dashboard</h1>
          <div className="text-muted small">
            Welcome back,{' '}
            <span className="user-badge">{currentUser.username}</span>
          </div>
        </div>
        <div>
          <small className="muted-small d-flex align-items-center gap-1">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5z"/>
              <path d="M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
            </svg>
            Privacy-first — only you can add interactions
          </small>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2">
        {/* Left Column */}
        <div>
          <div className="panel card-custom mb-3">
            <div className="panel-body card-body">
              <h2 className="mb-2 h5">Record an interaction</h2>
              <InteractionForm
                currentUser={currentUser}
                onSaved={handleInteractionSaved}
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="panel mb-3">
            <div className="panel-body">
              <h3 className="mb-2 h5">
                <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                Notes
              </h3>
              <p className="text-muted small mb-0">
                Your interaction history is private and not shown in this
                dashboard. Use the form above to log interactions with other
                community members.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <aside>
          {/* Quick Actions Card */}
          <div className="stat-card mb-3">
            <h2 className="h3">Quick actions</h2>
            <p className="mb-2">
              Use the form to record contacts quickly. Your data is stored
              securely.
            </p>
            {saveCount > 0 && (
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                  </svg>
                  {saveCount} interaction{saveCount !== 1 ? 's' : ''} recorded this session
                </small>
              </div>
            )}
          </div>

          {/* Account Panel */}
          <div className="panel mt-3">
            <div className="panel-body">
              <h2 className="mb-2 h6">
                <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
                Account
              </h2>
              <div className="small text-muted mb-1">
                Role: <strong className="text-body">{currentUser.role}</strong>
              </div>
              <div className="small text-muted">
                Status: <span className="badge bg-success-subtle text-success-emphasis">Active</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
