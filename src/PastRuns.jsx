import { useEffect, useState } from 'react';
import { request } from './api';
import RunGallery from './RunGallery';

export default function PastRuns() {
  const [runs, setRuns] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setBusy(true);
      setError('');
      try {
        const data = await request('/api/runs');
        if (active) setRuns(data.runs);
      } catch (failure) {
        if (active) setError(failure.message);
      } finally {
        if (active) setBusy(false);
      }
    }
    load();
    return () => { active = false; };
  }, [reload]);

  return <section aria-label="Past Runs">
    <div className="section-heading"><h2>Past Runs</h2>
      <button className="secondary" disabled={busy} onClick={() => setReload(reload + 1)}>Refresh</button>
    </div>
    {busy && <p role="status">Loading saved runs…</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {!busy && !error && runs.length === 0 && <div className="empty-state">No past runs.</div>}
    {!busy && !error && runs.map((run) => <RunGallery key={run.id} run={run} />)}
  </section>;
}
