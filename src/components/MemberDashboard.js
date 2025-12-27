import { useEffect, useState } from 'react';
import InteractionForm from './InteractionForm';

export default function MemberDashboard({ currentUser }) {
  // For privacy we no longer fetch or display a member's recent interactions on their dashboard.
  // InteractionForm remains available so users can record interactions, but the list is hidden.

  function formatWhen(value) {
    try {
      return new Date(value).toLocaleString();
    } catch (e) {
      return value;
    }
  }

  return (
    <div className="dashboard-content">
      <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="mb-1 dashboard-title">Member Dashboard</h2>
          <div className="text-muted small">Welcome back, <span className="user-badge">{currentUser.username}</span></div>
        </div>
        <div>
          <small className="muted-small">Privacy-first — only you can add interactions</small>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="panel card-custom mb-3">
            <div className="panel-body panel-body card-body">
              <h5 className="mb-2">Record an interaction</h5>
              <InteractionForm currentUser={currentUser} onSaved={() => { /* no-op: privacy policy */ }} />
            </div>
          </div>

          <div className="panel mb-3">
            <div className="panel-body">
              <h5 className="mb-2">Notes</h5>
              <p className="text-muted small mb-0">Your interaction history is private and not shown in this dashboard. Use the form above to log interactions with other community members.</p>
            </div>
          </div>
        </div>

        <aside>
          <div className="stat-card mb-3">
            <h3>Quick actions</h3>
            <p>Use the form to record contacts quickly. Your data is stored securely.</p>
          </div>

          <div className="panel mt-3">
            <div className="panel-body">
              <h6 className="mb-1">Account</h6>
              <div className="small text-muted">Role: <strong>{currentUser.role}</strong></div>
              <div className="small text-muted">Member since: <em>your account</em></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
