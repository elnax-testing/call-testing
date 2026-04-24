// ─── Dashboard Page ──────────────────────────────────────────────────────────

const STATUS_MAP = {
  booked:    { color: 'green', label: 'Booked' },
  completed: { color: 'blue',  label: 'Completed' },
  failed:    { color: 'red',   label: 'Failed' },
  unknown:   { color: 'gray',  label: 'Unknown' },
};

function fmtDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function fmtRelative(isoStr) {
  if (!isoStr) return '—';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function fmtFull(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function TranscriptModal({ call, onClose }) {
  if (!call) return null;
  const lines = (call.transcript || '').split('\n').filter(Boolean);
  const parsed = lines.map(l => {
    if (l.startsWith('Agent:') || l.startsWith('AI:')) return { role: 'agent', text: l.replace(/^(Agent:|AI:)\s*/, '') };
    if (l.startsWith('User:')) return { role: 'user', text: l.replace(/^User:\s*/, '') };
    return { role: 'agent', text: l };
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#13161e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaef' }}>{call.caller_name || 'Unknown'} · {call.phone_number}</div>
            <div style={{ fontSize: 12, color: '#7b849a', marginTop: 2 }}>{fmtFull(call.created_at)} · {fmtDuration(call.duration_seconds)}</div>
          </div>
          <C.Btn variant="ghost" size="sm" onClick={onClose}>✕</C.Btn>
        </div>
        <div style={{ padding: '8px 8px', overflowY: 'auto', flex: 1 }}>
          {call.summary && <>
            <div style={{ fontSize: 12, color: '#7b849a', padding: '8px 16px', fontWeight: 600 }}>AI SUMMARY</div>
            <div style={{ margin: '0 8px 12px', background: 'rgba(90,126,245,0.08)', border: '1px solid rgba(90,126,245,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c8cdd8', lineHeight: 1.6 }}>{call.summary}</div>
          </>}
          <div style={{ fontSize: 12, color: '#7b849a', padding: '8px 16px', fontWeight: 600 }}>TRANSCRIPT</div>
          {parsed.length > 0 ? (
            <div style={{ display: 'grid', gap: 8, padding: '0 8px 16px' }}>
              {parsed.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: t.role === 'agent' ? '#5a7ef5' : '#34d399', background: t.role === 'agent' ? 'rgba(90,126,245,0.1)' : 'rgba(52,211,153,0.1)', borderRadius: 4, padding: '2px 6px', flexShrink: 0, marginTop: 2 }}>
                    {t.role === 'agent' ? 'AI' : 'User'}
                  </div>
                  <div style={{ fontSize: 13, color: '#c8cdd8', lineHeight: 1.55 }}>{t.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '12px 16px', fontSize: 13, color: '#5a6375', fontStyle: 'italic' }}>No transcript available.</div>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
          <C.Btn variant="ghost" size="sm" onClick={() => window.open(`/api/logs/${call.id}/transcript`, '_blank')}>Download .txt</C.Btn>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [logs, setLogs] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => null),
      fetch('/api/logs').then(r => r.json()).catch(() => []),
    ]).then(([s, l]) => {
      setStats(s);
      setLogs(Array.isArray(l) ? l.slice(0, 10) : []);
      setLoading(false);
    });
  }, []);

  const avgDurSec = stats?.avg_duration ?? 0;
  const activeSessions = stats?.active_sessions ?? 1;

  return (
    <div>
      <C.PageHeader title="Dashboard" sub="Overview of your voice agent activity" />

      {loading ? <C.Spinner /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            <C.Stat label="Total Calls" value={stats?.total_calls ?? logs.length} sub="Last 7 days" />
            <C.Stat label="Avg Duration" value={fmtDuration(avgDurSec)} sub="Per call" />
            <C.Stat label="Booking Rate" value={`${Math.round(stats?.booking_rate ?? 0)}%`} sub={`${stats?.total_bookings ?? 0} bookings`} accent="#34d399" />
            <C.Stat label="Active Sessions" value={activeSessions} sub="Live right now" accent="#5a7ef5" />
          </div>

          <C.Card title="Recent Calls" action={<C.Btn variant="ghost" size="sm" onClick={() => {}}>View All Logs</C.Btn>}>
            <C.Table
              cols={['Time', 'Phone / Name', 'Duration', 'Status', 'Actions']}
              empty="No calls yet."
              rows={logs.map(call => {
                const sm = STATUS_MAP[call.status] || STATUS_MAP.unknown;
                return [
                  <div>
                    <div style={{ fontWeight: 600, color: '#e8eaef' }}>{fmtRelative(call.created_at)}</div>
                    <div style={{ fontSize: 11, color: '#5a6375', marginTop: 2 }}>{fmtFull(call.created_at)}</div>
                  </div>,
                  <div>
                    <div style={{ fontWeight: 600, color: '#e8eaef', fontVariantNumeric: 'tabular-nums' }}>{call.phone_number}</div>
                    <div style={{ fontSize: 11, color: '#7b849a', marginTop: 2 }}>{call.caller_name || 'Unknown'}</div>
                  </div>,
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: '#c8cdd8' }}>{fmtDuration(call.duration_seconds)}</span>,
                  <C.Badge color={sm.color}>{sm.label}</C.Badge>,
                  <div style={{ display: 'flex', gap: 6 }}>
                    <C.Btn variant="ghost" size="sm" onClick={() => setSelected(call)}>Transcript</C.Btn>
                  </div>,
                ];
              })}
            />
          </C.Card>
        </>
      )}

      <TranscriptModal call={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

Object.assign(window, { DashboardPage });
