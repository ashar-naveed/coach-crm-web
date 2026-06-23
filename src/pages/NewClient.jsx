import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const LIFECYCLE_STAGES = ['Discovery', 'Goal Setting', 'Active Coaching', 'Midpoint Review', 'Closure'];

export default function NewClient() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    organization: '',
    job_title: '',
    coaching_type: '',
    start_date: '',
    lifecycle_stage: 'Discovery',
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email) {
      setError('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/clients/create.php', form);
      navigate('/clients');
    } catch (err) {
      setError(err.message || 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate('/clients')}>← Clients</button>

      <div className="page-header">
        <h2>New Client</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="notes-form">
        <h3>Account</h3>
        <div className="log-form__row">
          <div className="form-group" style={{flex:1}}>
            <label>Full Name *</label>
            <input placeholder="Ahmed Al-Qahtani" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1}}>
            <label>Email *</label>
            <input type="email" placeholder="ahmed@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>
        <div className="log-form__row">
          <div className="form-group" style={{flex:1}}>
            <label>Phone</label>
            <input placeholder="+966501234567" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1}}>
            <label>Initial Password</label>
            <input value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
        </div>

        <h3 style={{marginTop:'1rem'}}>Professional Info</h3>
        <div className="log-form__row">
          <div className="form-group" style={{flex:1}}>
            <label>Organization</label>
            <input placeholder="Aramco" value={form.organization} onChange={e => set('organization', e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1}}>
            <label>Job Title</label>
            <input placeholder="Operations Manager" value={form.job_title} onChange={e => set('job_title', e.target.value)} />
          </div>
        </div>

        <h3 style={{marginTop:'1rem'}}>Coaching Details</h3>
        <div className="log-form__row">
          <div className="form-group" style={{flex:1}}>
            <label>Coaching Type</label>
            <input placeholder="Executive Coaching" value={form.coaching_type} onChange={e => set('coaching_type', e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1}}>
            <label>Start Date</label>
            <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Lifecycle Stage</label>
          <select value={form.lifecycle_stage} onChange={e => set('lifecycle_stage', e.target.value)}>
            {LIFECYCLE_STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating…' : 'Create Client'}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/clients')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
