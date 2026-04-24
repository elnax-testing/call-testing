// ─── Calendar Page ───────────────────────────────────────────────────────────

const STATUS_APPT = {
  scheduled:   { color: 'blue',   label: 'Scheduled' },
  completed:   { color: 'green',  label: 'Completed' },
  cancelled:   { color: 'red',    label: 'Cancelled' },
  rescheduled: { color: 'amber',  label: 'Rescheduled' },
};

function ApptModal({ appt, onClose, onSave }) {
  const isEdit = !!appt;
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const defaultStart = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate()+1)}T10:00`;
  const defaultEnd   = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate()+1)}T11:00`;

  const initForm = isEdit ? {
    title: appt.title || '',
    contact_name: appt.contact_name || '',
    contact_phone: appt.contact_phone || '',
    scheduled_start: new Date(appt.scheduled_start).toISOString().slice(0, 16),
    scheduled_end: appt.scheduled_end ? new Date(appt.scheduled_end).toISOString().slice(0, 16) : '',
    notes: appt.notes || '',
    status: appt.status || 'scheduled'
  } : { 
    title: '', contact_name: '', contact_phone: '', scheduled_start: defaultStart, scheduled_end: defaultEnd, notes: '', status: 'scheduled' 
  };

  const [form, setForm] = React.useState(initForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(isEdit ? `/api/appointments/${appt.id}` : '/api/appointments', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Failed to save');
      onSave(data.appointment || data, isEdit);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#13161e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8eaef' }}>{isEdit ? 'Edit Appointment' : 'New Appointment'}</span>
          <C.Btn variant="ghost" size="sm" onClick={onClose}>✕</C.Btn>
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
          <C.Input label="Title" value={form.title} onChange={set('title')} placeholder="e.g. Site Visit – Escala Heights" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <C.Input label="Contact Name" value={form.contact_name} onChange={set('contact_name')} placeholder="Full name" />
            <C.Input label="Phone" value={form.contact_phone} onChange={set('contact_phone')} placeholder="+91 98765 43210" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <C.Input label="Start" type="datetime-local" value={form.scheduled_start} onChange={set('scheduled_start')} />
            <C.Input label="End" type="datetime-local" value={form.scheduled_end} onChange={set('scheduled_end')} />
          </div>
          {isEdit && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#7b849a', marginBottom: 6 }}>Status</div>
              <select value={form.status} onChange={e => set('status')(e.target.value)} style={{ width: '100%', background: '#1a1e28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 12px', color: '#e8eaef' }}>
                {Object.keys(STATUS_APPT).map(k => <option key={k} value={k}>{STATUS_APPT[k].label}</option>)}
              </select>
            </div>
          )}
          <C.Input label="Notes" value={form.notes} onChange={set('notes')} rows={3} placeholder="Any additional notes…" />
          {error && <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.1)', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <C.Btn variant="ghost" onClick={onClose}>Cancel</C.Btn>
          <C.Btn variant="primary" onClick={handleSave} disabled={saving || !form.title}>{saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Appointment')}</C.Btn>
        </div>
      </div>
    </div>
  );
}

function CalendarPage() {
  const [view, setView] = React.useState('Month');
  const [editingAppt, setEditingAppt] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [appts, setAppts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [curDate, setCurDate] = React.useState(new Date());

  React.useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(data => { setAppts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const curMonth = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
  const monthName = curMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const weekName = `Week of ${new Date(curDate.setDate(curDate.getDate() - curDate.getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  const dayName = curDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const firstDay = curMonth.getDay();
  const daysInMonth = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  
  const getApptForDay = (d, m, y) => appts.filter(a => {
    const ad = new Date(a.scheduled_start);
    return ad.getDate() === d && ad.getMonth() === m && ad.getFullYear() === y;
  }).sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));

  const upcoming = [...appts]
    .filter(a => a.status === 'scheduled' && new Date(a.scheduled_start) >= new Date())
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))
    .slice(0, 20);

  const prevRange = () => {
    if (view === 'Month') setCurDate(new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1));
    else if (view === 'Week') setCurDate(new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() - 7));
    else setCurDate(new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() - 1));
  };
  
  const nextRange = () => {
    if (view === 'Month') setCurDate(new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1));
    else if (view === 'Week') setCurDate(new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + 7));
    else setCurDate(new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + 1));
  };

  const handleDayClick = (day) => {
    if (!day) return;
    setCurDate(new Date(curMonth.getFullYear(), curMonth.getMonth(), day));
    setView('Day');
  };

  const renderApptBlock = (a) => (
    <div key={a.id} onClick={(e) => { e.stopPropagation(); setEditingAppt(a); setShowModal(true); }}
      style={{ cursor: 'pointer', background: 'rgba(90,126,245,0.2)', borderRadius: 4, padding: '4px 6px', fontSize: 11, color: '#a0b0f0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: `2px solid ${STATUS_APPT[a.status]?.color === 'green' ? '#34d399' : (STATUS_APPT[a.status]?.color === 'red' ? '#f87171' : '#5a7ef5')}` }}>
      <span style={{ fontWeight: 600 }}>{new Date(a.scheduled_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(' ', '')}</span> {a.contact_name} - {a.title}
    </div>
  );

  return (
    <div>
      <C.PageHeader title="Calendar" sub="Team appointments and site visits"
        action={<C.Btn variant="primary" onClick={() => { setEditingAppt(null); setShowModal(true); }}>+ New Appointment</C.Btn>} />

      {loading ? <C.Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <C.Card>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <C.Btn variant="ghost" size="sm" onClick={prevRange}>‹</C.Btn>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#e8eaef', flex: 1, textAlign: 'center' }}>
                {view === 'Month' ? monthName : (view === 'Week' ? weekName : dayName)}
              </span>
              <C.Btn variant="ghost" size="sm" onClick={nextRange}>›</C.Btn>
              <C.Tabs tabs={['Month','Week','Day']} active={view} onChange={setView} />
            </div>
            <div style={{ padding: '12px 16px' }}>
              
              {view === 'Month' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#7b849a', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                    {cells.map((day, i) => {
                      const dayAppts = day ? getApptForDay(day, curMonth.getMonth(), curMonth.getFullYear()) : [];
                      const isToday = day && today.getMonth() === curMonth.getMonth() && today.getFullYear() === curMonth.getFullYear() && day === today.getDate();
                      return (
                        <div key={i} onClick={() => handleDayClick(day)} style={{ cursor: day ? 'pointer' : 'default', minHeight: 90, padding: 4, borderRadius: 8, background: isToday ? 'rgba(90,126,245,0.08)' : 'transparent', border: isToday ? '1px solid rgba(90,126,245,0.3)' : '1px solid transparent', transition: 'background 0.2s' }}>
                          {day && <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#5a7ef5' : '#c8cdd8', marginBottom: 4, textAlign: 'right', paddingRight: 2 }}>{day}</div>}
                          {dayAppts.slice(0, 3).map((a) => renderApptBlock(a))}
                          {dayAppts.length > 3 && <div style={{ fontSize: 10, color: '#a0b0f0', fontWeight: 600, textAlign: 'center', background: 'rgba(90,126,245,0.1)', borderRadius: 4, padding: '2px', marginTop: 4 }}>+{dayAppts.length - 3} more</div>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {view === 'Week' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
                  {Array.from({length: 7}).map((_, i) => {
                    const startOfWeek = new Date(curDate);
                    startOfWeek.setDate(curDate.getDate() - curDate.getDay() + i);
                    const isToday = startOfWeek.toDateString() === today.toDateString();
                    const dayAppts = getApptForDay(startOfWeek.getDate(), startOfWeek.getMonth(), startOfWeek.getFullYear());
                    return (
                      <div key={i} style={{ minHeight: 400, padding: 8, borderRadius: 8, background: isToday ? 'rgba(90,126,245,0.04)' : 'rgba(255,255,255,0.02)' }}>
                        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? '#5a7ef5' : '#7b849a', marginBottom: 12, cursor: 'pointer' }} onClick={() => { setCurDate(startOfWeek); setView('Day'); }}>
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]} {startOfWeek.getDate()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {dayAppts.map(a => renderApptBlock(a))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'Day' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 400, padding: 12 }}>
                  {getApptForDay(curDate.getDate(), curDate.getMonth(), curDate.getFullYear()).length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#5a6375', fontStyle: 'italic', padding: 40 }}>No appointments for this day.</div>
                  ) : getApptForDay(curDate.getDate(), curDate.getMonth(), curDate.getFullYear()).map(a => (
                    <div key={a.id} onClick={() => { setEditingAppt(a); setShowModal(true); }} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${STATUS_APPT[a.status]?.color === 'green' ? '#34d399' : (STATUS_APPT[a.status]?.color === 'red' ? '#f87171' : '#5a7ef5')}`, borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#e8eaef', marginBottom: 4 }}>{a.title}</div>
                        <div style={{ fontSize: 13, color: '#7b849a' }}>{a.contact_name} · {a.contact_phone}</div>
                        {a.notes && <div style={{ fontSize: 12, color: '#5a6375', marginTop: 6, fontStyle: 'italic' }}>{a.notes}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#a0b0f0', marginBottom: 4 }}>{new Date(a.scheduled_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        <C.Badge color={STATUS_APPT[a.status]?.color || 'gray'}>{STATUS_APPT[a.status]?.label || a.status}</C.Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </C.Card>

          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <C.Card title={`Upcoming (${upcoming.length})`}>
              <div style={{ padding: '8px 0', maxHeight: '500px', overflowY: 'auto' }}>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '20px 18px', fontSize: 13, color: '#5a6375', fontStyle: 'italic' }}>No upcoming appointments.</div>
                ) : upcoming.map(a => (
                  <div key={a.id} onClick={() => { setEditingAppt(a); setShowModal(true); }} style={{ cursor: 'pointer', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaef', lineHeight: 1.3 }}>{a.title}</div>
                      <C.Badge color={STATUS_APPT[a.status]?.color || 'gray'}>{STATUS_APPT[a.status]?.label || a.status}</C.Badge>
                    </div>
                    <div style={{ fontSize: 12, color: '#7b849a', marginTop: 4 }}>{a.contact_name} · {a.contact_phone}</div>
                    <div style={{ fontSize: 12, color: '#5a6375', marginTop: 2 }}>
                      {new Date(a.scheduled_start).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                ))}
              </div>
            </C.Card>
          </div>
        </div>
      )}

      {showModal && (
        <ApptModal
          appt={editingAppt}
          onClose={() => { setShowModal(false); setEditingAppt(null); }}
          onSave={(appt, isEdit) => {
            if (isEdit) {
              setAppts(p => p.map(a => a.id === appt.id ? appt : a));
            } else {
              setAppts(p => [appt, ...p]);
            }
          }}
        />
      )}
    </div>
  );
}

Object.assign(window, { CalendarPage });
