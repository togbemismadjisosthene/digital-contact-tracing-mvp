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
      <div className="mb-4">
        <h2 className="mb-1 dashboard-title">Member Form</h2>
        <div className="text-muted small">Logged in as <strong>{currentUser.username}</strong></div>
      </div>

      <InteractionForm currentUser={currentUser} onSaved={() => { /* no-op: we do not reload/display interactions for privacy */ }} />

      <section className="mt-4">
        <div className="alert alert-secondary">
          For privacy, recent interactions are not displayed on this dashboard. Use the form above to record interactions.
        </div>
      </section>
    </div>
  );
}
