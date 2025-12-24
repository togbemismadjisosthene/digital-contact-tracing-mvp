import { useEffect, useState } from 'react';
import { getUsers, reportCase as apiReportCase, reportCaseWithDate, getCases, trace, getAdminInteractions, simulateNotification as apiSimulateNotification } from '../utils/api';
import TraceResults from './TraceResults';

export default function AdminDashboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [caseUserId, setCaseUserId] = useState('');
  const [reportedAt, setReportedAt] = useState('');
  const [caseIdSelected, setCaseIdSelected] = useState('');
  const [cases, setCases] = useState([]);
  const [results, setResults] = useState([]);
  const [windowDays, setWindowDays] = useState(14);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notificationContact, setNotificationContact] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const u = await getUsers();
        setUsers(u || []);
        const cs = await getCases();
        setCases(cs || []);
  // load all interactions for admin
  const its = await getAdminInteractions();
        setInteractions(its || []);
        // no templates; use default privacy-preserving message by default
      } catch (err) {
        console.error('Admin load failed', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [interactions, setInteractions] = useState([]);

  async function reportCase(e) {
    e.preventDefault();
    if (!caseUserId) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      // use reportedAt if provided
      if (reportedAt) {
        // convert datetime-local to ISO
        const reportedAtIso = new Date(reportedAt).toISOString();
        await reportCaseWithDate({ userId: caseUserId, reportedAt: reportedAtIso });
      } else {
        await apiReportCase({ userId: caseUserId });
      }
      const cs = await getCases();
      setCases(cs || []);
      const selectedUser = users.find(u => String(u.id) === String(caseUserId));
      setSuccess(`Case reported successfully for ${selectedUser?.username || 'user'}.`);
      setCaseUserId(''); // Reset selection
      setResults([]); // Clear previous trace results
    } catch (err) {
      console.error('Report case failed', err);
      setError(err.error || 'Could not report case. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function runTrace() {
    if (!caseUserId) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await trace({ caseUserId, windowDays: Number(windowDays) || 14 });
      setResults(res || []);
      const selectedUser = users.find(u => String(u.id) === String(caseUserId));
      if (res && res.length > 0) {
        setSuccess(`Found ${res.length} primary contact(s) for ${selectedUser?.username || 'user'} within the last ${windowDays} days.`);
      } else {
        setSuccess(`No primary contacts found for ${selectedUser?.username || 'user'} within the last ${windowDays} days.`);
      }
    } catch (err) {
      console.error('Trace failed', err);
      setError(err.error || 'Trace failed. Please check the case user ID and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function simulateNotification(contact) {
    // Call backend to record a simulated notification (demo only)
    (async () => {
      try {
        setSubmitting(true);
  // Use default privacy-preserving notification (no identifying details)
  await apiSimulateNotification({ userId: contact.id, caseId: caseIdSelected || null, message: null });
        setNotificationContact(contact);
        setSuccess(`Simulated notification recorded for ${contact.username || contact.id}.`);
        // Clear temporary UI cue after 6s
        setTimeout(() => {
          setNotificationContact(null);
          setSuccess('');
        }, 6000);
      } catch (err) {
        console.error('Simulate notify failed', err);
        setError(err.error || 'Could not simulate notification.');
      } finally {
        setSubmitting(false);
      }
    })();
  }

  // no template saving in default mode

  function formatWhen(value) {
    try {
      return new Date(value).toLocaleString();
    } catch (e) {
      return value;
    }
  }

  function usernameForId(id) {
    const u = users.find(x => String(x.id) === String(id));
    return u ? u.username : id;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-1 dashboard-title">Administrator dashboard</h2>
          <div className="text-muted small">Signed in as <strong>{currentUser.username}</strong></div>
        </div>
        <span className="badge bg-warning text-dark">Admin tools</span>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success:</strong> {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
        </div>
      )}

      {notificationContact && (
        <div className="alert alert-info" role="alert">
          <strong>Notification Simulated:</strong> A notification would be sent to <strong>{notificationContact.username}</strong> (ID: {notificationContact.id}) in a production environment.
        </div>
      )}

      <section>
        <div className="card card-custom mb-3 centered-card">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title mb-1">Report a confirmed case</h5>
              <div className="card-subtitle text-muted small">Select the confirmed individual and (optionally) provide the confirmation date. This action records a reported case for tracing.</div>
            </div>
            <form onSubmit={reportCase} className="row g-3 align-items-end">
              <div className="col-md-8">
                <label className="form-label">Confirmed person</label>
                <select className="form-select" value={caseUserId} onChange={e => setCaseUserId(e.target.value)} required disabled={loading}>
                  <option value="">-- choose user --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Confirmation date (optional)</label>
                <input className="form-control" type="datetime-local" value={reportedAt} onChange={e => setReportedAt(e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-danger primary-action flex-fill" type="submit" disabled={!caseUserId || submitting}>Report case</button>
                <div className="ms-auto d-flex gap-2">
                  <label className="form-label mb-0 small text-muted align-self-center me-2">Window (days)</label>
                  <input className="form-control form-control-sm" style={{ width: 90 }} type="number" min="1" max="90" value={windowDays} onChange={e=>setWindowDays(e.target.value)} />
                  <button type="button" className="btn btn-outline-secondary" onClick={runTrace} disabled={!caseUserId || submitting}>
                    {submitting ? 'Running…' : 'Find primary contacts'}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3">
              <label className="form-label">Or pick a reported case to trace</label>
              <div className="d-flex gap-2">
                <select className="form-select" value={caseIdSelected} onChange={e => { setCaseIdSelected(e.target.value); const sel = cases.find(c=>String(c.id)===e.target.value); if(sel) setCaseUserId(sel.user_id); }}>
                  <option value="">-- choose reported case --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>#{c.id} — {c.username || c.user_id} (reported at {formatWhen(c.reported_at)})</option>
                  ))}
                </select>
                <button className="btn btn-outline-primary" type="button" onClick={runTrace} disabled={!caseUserId || submitting}>Trace selected case</button>
              </div>
            </div>

            <div className="mt-3">
              <div className="small text-muted">Using default privacy-preserving notification message. Admin cannot edit the message here.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-3">
        <div className="card card-custom mb-3">
          <div className="card-body">
            <h5 className="card-title mb-3">All interactions</h5>
            {loading && <div className="text-muted">Loading interactions…</div>}
            {!loading && interactions.length === 0 && <div className="text-muted">No interactions recorded yet.</div>}
            {!loading && interactions.length > 0 && (
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>When</th>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Duration (min)</th>
                      <th>Notes</th>
                      <th>Recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interactions.map(i => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{formatWhen(i.when_ts || i.when)}</td>
                        <td>{usernameForId(i.user_id)}</td>
                        <td>{usernameForId(i.contact_user_id)}</td>
                        <td>{i.duration_minutes ?? i.durationMinutes ?? 0}</td>
                        <td>{i.notes || ''}</td>
                        <td>{formatWhen(i.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-3">
        <TraceResults results={results} onSimulate={simulateNotification} />
      </section>

      <section className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Reported cases</h5>
          <span className="badge bg-light text-dark">{cases.length}</span>
        </div>
        {loading && <div className="text-muted">Loading cases…</div>}
        {!loading && cases.length === 0 && <div className="text-muted">No cases reported yet.</div>}
        {!loading && cases.length > 0 && (
          <ul className="list-group">
            {cases.map(c => <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{c.username || c.user_id}</strong>
                <div className="small text-muted">Reported at {formatWhen(c.reported_at)}</div>
              </div>
              <span className="badge bg-danger-subtle text-danger">#{c.id}</span>
            </li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
