import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function NewSession() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    client_profile_id: '',
    session_datetime: '',
    duration_minutes: '60',
    type: 'online',
    meeting_link: '',
    location: '',
  });

  useEffect(() => {
    api.get('/clients/index.php').then(res => setClients(res.data)).catch(() => {});
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.client_profile_id || !form.session_datetime) {
      setError('Client and date/time are required');
      return;
    }
    if (form.type === 'online' && !form.meeting_link) {
      setError('Meeting link is required for online sessions');
      return;
    }
    if (form.type === 'physical' && !form.location) {
      setError('Location is required for physical sessions');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        client_profile_id: parseInt(form.client_profile_id),
        session_datetime: form.session_datetime.replace('T', ' ') + ':00',
        duration_minutes: parseInt(form.duration_minutes),
        type: form.type,
        meeting_link: form.type === 'online' ? form.meeting_link : undefined,
        location: form.type === 'physical' ? form.location : undefined,
      };
      await api.post('/sessions/index.php', payload);
      navigate('/sessions');
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate('/sessions')}>← Sessions</button>

      <div className="page-header">
        <h2>Schedule Session</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="notes-form">
        <div className="form-group">
          <label>Client *</label>
          <select value={form.client_profile_id} onChange={e => set('client_profile_id', e.target.value)}>
            <option value="">Select a client…</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="log-form__row">
          <div className="form-group" style={{flex:2}}>
            <label>Date & Time *</label>
            <input type="datetime-local" value={form.session_datetime} onChange={e => set('session_datetime', e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1}}>
            <label>Duration (minutes)</label>
            <input type="number" min="15" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Session Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="online">Online</option>
            <option value="physical">Physical</option>
          </select>
        </div>

        {form.type === 'online' && (
          <div className="form-group">
            <label>Meeting Link *</label>
            <input placeholder="https://meet.google.com/..." value={form.meeting_link} onChange={e => set('meeting_link', e.target.value)} />
          </div>
        )}

        {form.type === 'physical' && (
          <div className="form-group">
            <label>Location *</label>
            <input placeholder="Office, Room 3B, Riyadh" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Scheduling…' : 'Schedule Session'}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/sessions')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
