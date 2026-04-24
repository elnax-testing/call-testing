// ─── Call Logs Page ──────────────────────────────────────────────────────────

const LOG_STATUS_COLORS = { booked: 'green', completed: 'blue', failed: 'red', unknown: 'gray' };

function fmtDur(sec) {
  if (!sec && sec !== 0) return '—';
  return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function CallLogsPage() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetch('/api/logs')
      .then(r => r.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.phone_number || '').includes(q) || (c.caller_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const booked = logs.filter(c => c.status === 'booked').length;
  const failed  = logs.filter(c => c.status === 'failed').length;

  return (
    <div>
      <C.PageHeader title="Call Logs" sub="Complete history of all agent calls" />

      {loading ? <C.Spinner /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            <C.Stat label="Total Calls" value={logs.length} />
            <C.Stat label="Booked" value={booked} accent="#34d399" />
            <C.Stat label="Failed" value={failed} accent="#f87171" />
            <C.Stat label="Booking Rate" value={logs.length ? `${Math.round(booked / logs.length * 100)}%` : '—'} accent="#5a7ef5" />
          </div>

          <C.Card title="All Calls" action={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search phone or name…"
                style={{ background: '#1a1e28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaef', fontSize: 12, padding: '6px 12px', outline: 'none', width: 200 }} />
              <C.Tabs tabs={['all','booked','completed','failed']} active={filter} onChange={setFilter} />
            </div>
          }>
            <C.Table
              cols={['Date & Time', 'Phone / Name', 'Duration', 'Status', 'Summary', 'Transcript']}
              empty="No calls match the current filter."
              rows={filtered.map(c => {
                const sm = LOG_STATUS_COLORS[c.status] || 'gray';
                return [
                  <div style={{ fontWeight: 600, color: '#e8eaef', fontSize: 12 }}>{fmtDateTime(c.created_at)}</div>,
                  <div>
                    <div style={{ fontWeight: 600, color: '#e8eaef', fontVariantNumeric: 'tabular-nums' }}>{c.phone_number}</div>
                    <div style={{ fontSize: 11, color: '#7b849a', marginTop: 2 }}>{c.caller_name || 'Unknown'}</div>
                  </div>,
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDur(c.duration_seconds)}</span>,
                  <C.Badge color={sm}>{(c.status || 'unknown').charAt(0).toUpperCase() + (c.status || 'unknown').slice(1)}</C.Badge>,
                  <div style={{ maxWidth: 280, fontSize: 12, color: '#7b849a', lineHeight: 1.5 }}>{c.summary || '—'}</div>,
                  <C.Btn variant="ghost" size="sm" onClick={() => window.open(`/api/logs/${c.id}/transcript`, '_blank')}>Download</C.Btn>,
                ];
              })}
            />
          </C.Card>
        </>
      )}
    </div>
  );
}

Object.assign(window, { CallLogsPage });
