import { useEffect, useState } from 'react';
import { addInteraction, getUsers } from '../utils/api';

export default function InteractionForm({ currentUser, onSaved }) {
  const [contactId, setContactId] = useState('');
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0,16));
  const [duration, setDuration] = useState('15');
  const [notes, setNotes] = useState('');
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      setError('');
      try {
        const u = await getUsers();
        if (u && Array.isArray(u)) {
          setUsers(u);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Could not load users', err);
        setError('Unable to load users. Please make sure you are logged in and refresh the page.');
      }
    }
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await addInteraction({
        contactUserId: contactId,
        when: when || new Date().toISOString(),
        durationMinutes: Number(duration) || 0,
        notes,
      });
      const contactUser = users.find(u => String(u.id) === String(contactId));
      setContactId('');
      setWhen(new Date().toISOString().slice(0,16));
      setDuration('15');
      setNotes('');
      setSuccess(`Interaction with ${contactUser?.username || 'user'} logged successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Save failed', err);
      setError(err.error || 'Could not save interaction. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const selectableUsers = users.filter(u => String(u.id) !== String(currentUser.id));

  return (
    <div className="card card-custom mb-3 centered-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="card-title mb-1">Log an interaction</h5>
            <div className="card-subtitle text-muted small">Record a recent contact with another person (privacy-preserving)</div>
          </div>
        </div>
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Contact (select person you met)</label>
            <select className="form-select" value={contactId} onChange={e => setContactId(e.target.value)} required>
              <option value="">-- choose user --</option>
              {selectableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role || 'member'})</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">When</label>
            <input className="form-control" type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Duration (minutes)</label>
            <input className="form-control" type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Notes (optional, privacy-safe)</label>
            <input className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional: brief context (no names, locations)" />
          </div>
          {error && (
            <div className="col-12">
              <div className="alert alert-danger mb-0" role="alert">
                <small>{error}</small>
              </div>
            </div>
          )}
          {success && (
            <div className="col-12">
              <div className="alert alert-success mb-0" role="alert">
                <small>{success}</small>
              </div>
            </div>
          )}
          <div className="col-12 d-flex justify-content-end">
            <button 
              className="btn btn-primary primary-action" 
              type="submit" 
              disabled={saving || !contactId || selectableUsers.length === 0}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving…
                </>
              ) : (
                'Save interaction'
              )}
            </button>
          </div>
          {selectableUsers.length === 0 && users.length > 0 && (
            <div className="col-12">
              <div className="alert alert-warning mb-0" role="alert">
                <small>No other users available to log interactions with.</small>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
