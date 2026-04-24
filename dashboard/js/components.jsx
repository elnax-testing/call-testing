// ─── Shared UI primitives ────────────────────────────────────────────────────
const C = {};

C.Badge = ({ color = 'blue', children }) => {
  const colors = {
    green:  { bg: 'rgba(52,211,153,0.12)', text: '#34d399', dot: '#34d399' },
    amber:  { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', dot: '#fbbf24' },
    red:    { bg: 'rgba(248,113,113,0.12)', text: '#f87171', dot: '#f87171' },
    blue:   { bg: 'rgba(90,126,245,0.12)',  text: '#5a7ef5', dot: '#5a7ef5' },
    purple: { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa', dot: '#a78bfa' },
    gray:   { bg: 'rgba(120,128,148,0.12)', text: '#7b849a', dot: '#7b849a' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.text,
      padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.03em'
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {children}
    </span>
  );
};

C.Btn = ({ variant = 'primary', size = 'md', children, onClick, disabled, style: s }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none',
    cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600,
    borderRadius: 8, transition: 'opacity 0.15s, background 0.15s',
    opacity: disabled ? 0.45 : 1, outline: 'none',
    ...(size === 'sm' ? { fontSize: 12, padding: '5px 12px' } : { fontSize: 13, padding: '8px 16px' }),
  };
  const variants = {
    primary:  { background: '#5a7ef5', color: '#fff' },
    ghost:    { background: 'rgba(255,255,255,0.05)', color: '#e8eaef', border: '1px solid rgba(255,255,255,0.08)' },
    danger:   { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' },
    success:  { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...s }} onClick={!disabled ? onClick : undefined}>
      {children}
    </button>
  );
};

C.Input = ({ label, value, onChange, type = 'text', placeholder, mono, rows, hint, style: s, disabled }) => (
  <div style={{ display: 'grid', gap: 5, ...s }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#7b849a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>}
    {rows ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled}
        style={{ background: '#1a1e28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaef', fontSize: 13, padding: '10px 12px', fontFamily: mono ? 'monospace' : 'inherit', resize: 'vertical', outline: 'none', width: '100%', boxSizing: 'border-box', opacity: disabled ? 0.5 : 1 }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ background: '#1a1e28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaef', fontSize: 13, padding: '9px 12px', fontFamily: mono ? 'monospace' : 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box', opacity: disabled ? 0.5 : 1 }} />
    )}
    {hint && <span style={{ fontSize: 11, color: '#5a6375' }}>{hint}</span>}
  </div>
);

C.Select = ({ label, value, onChange, options, hint, style: s }) => (
  <div style={{ display: 'grid', gap: 5, ...s }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#7b849a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background: '#1a1e28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaef', fontSize: 13, padding: '9px 12px', outline: 'none', width: '100%', cursor: 'pointer' }}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
    {hint && <span style={{ fontSize: 11, color: '#5a6375' }}>{hint}</span>}
  </div>
);

C.Toggle = ({ label, checked, onChange, hint }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
    <div onClick={() => onChange(!checked)}
      style={{ width: 36, height: 20, borderRadius: 999, background: checked ? '#5a7ef5' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
    <div>
      <div style={{ fontSize: 13, color: '#e8eaef', fontWeight: 500 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: '#5a6375', marginTop: 2 }}>{hint}</div>}
    </div>
  </div>
);

C.Card = ({ children, style: s, title, action }) => (
  <div style={{ background: '#13161e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, ...s }}>
    {title && (
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e8eaef', letterSpacing: '-0.01em' }}>{title}</span>
        {action}
      </div>
    )}
    {children}
  </div>
);

C.Table = ({ cols, rows, empty = 'No data' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} style={{ padding: '10px 16px', textAlign: 'left', color: '#7b849a', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={cols.length} style={{ padding: '32px 16px', textAlign: 'center', color: '#5a6375', fontStyle: 'italic' }}>{empty}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '12px 16px', color: '#c8cdd8', verticalAlign: 'middle' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

C.Stat = ({ label, value, sub, accent }) => (
  <div style={{ background: '#13161e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 24px' }}>
    <div style={{ fontSize: 12, color: '#7b849a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 800, color: accent || '#e8eaef', letterSpacing: '-0.03em', marginTop: 8, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#5a6375', marginTop: 6 }}>{sub}</div>}
  </div>
);

C.Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, width: 'fit-content' }}>
    {tabs.map(t => (
      <button key={t} onClick={() => onChange(t)}
        style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
          background: active === t ? '#1a1e28' : 'transparent',
          color: active === t ? '#e8eaef' : '#7b849a',
          boxShadow: active === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
        {t}
      </button>
    ))}
  </div>
);

C.PageHeader = ({ title, sub, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e8eaef', letterSpacing: '-0.03em' }}>{title}</h1>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7b849a' }}>{sub}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

C.SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#7b849a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
    {children}
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
  </div>
);

C.Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
    <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#5a7ef5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Toast notification system ───────────────────────────────────────────────
C.useToast = () => {
  const [toasts, setToasts] = React.useState([]);
  const addToast = React.useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);
  return { toasts, addToast };
};

C.ToastContainer = ({ toasts }) => {
  const typeStyles = {
    success: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', color: '#34d399', icon: '✓' },
    error:   { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', color: '#f87171', icon: '✕' },
    info:    { bg: 'rgba(90,126,245,0.15)', border: 'rgba(90,126,245,0.3)', color: '#5a7ef5', icon: 'ℹ' },
    warning: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24', icon: '⚠' },
  };
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
      {toasts.map(t => {
        const s = typeStyles[t.type] || typeStyles.info;
        return (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '10px 16px', animation: 'toastIn 0.3s ease-out', backdropFilter: 'blur(12px)' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: s.color, flexShrink: 0 }}>{s.icon}</span>
            <span style={{ fontSize: 13, color: '#e8eaef', fontWeight: 500 }}>{t.message}</span>
          </div>
        );
      })}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@media (prefers-reduced-motion: reduce) { @keyframes toastIn { from { opacity:0; } to { opacity:1; } } }`}</style>
    </div>
  );
};

Object.assign(window, { C });
