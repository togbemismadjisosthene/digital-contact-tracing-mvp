export default function TraceResults({ results = [], onSimulate }) {
  const hasResults = results.length > 0;

  const formatWhen = (value) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  if (!hasResults) {
    return (
      <div className="card card-custom">
        <div className="card-body text-center text-muted">
          <p className="mb-0">
            No primary contacts found for the selected case within the specified time window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Primary contacts</h5>
        <span className="badge bg-warning text-dark">
          {results.length} contact{results.length !== 1 && 's'}
        </span>
      </div>

      {/* Info */}
      <div className="alert alert-info mb-3">
        <small>
          <strong>Note:</strong> These are individuals who had direct interactions with the reported case.
          Review each contact and use "Simulate notification" to trigger a simulated alert.
        </small>
      </div>

      {/* List */}
      <ul className="list-group">
        {results.map((contact, index) => {
          const {
            id,
            username,
            when,
            durationMinutes = 0,
          } = contact;

          return (
            <li key={id ?? index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong>{username || `User ${id}`}</strong>
                    <span className="badge bg-secondary">ID: {id}</span>
                  </div>

                  <div className="small text-muted">
                    <div>
                      Interaction date: <strong>{formatWhen(when)}</strong>
                    </div>
                    <div>
                      Duration: <strong>{durationMinutes} minutes</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onSimulate(contact)}
                  title={`Simulate notification to ${username}`}
                >
                  Simulate notification
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
