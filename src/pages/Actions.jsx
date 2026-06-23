import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STATUS_COLORS = { pending: 'amber', done: 'green', delayed: 'coral' };

export default function Actions() {
  const { user }              = useAuth();
  const isCoach               = user?.role === 'coach' || user?.role === 'admin';
  const [items, setItems]     = useState([]);
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCoach) {
      api.get('/clients/index.php').then(async cRes => {
        const clients = cRes.data || [];
        const all = [];
        for (const client of clients) {
          const gRes = await api.get(`/goals/index.php?client_id=${client.id}`).catch(() => ({ data: [] }));
          for (const goal of (gRes.data || [])) {
            const aRes = await api.get(`/action-items/index.php?goal_id=${goal.id}`).catch(() => ({ data: [] }));
            for (const item of (aRes.data || [])) {
              all.push({ ...item, client_name: client.name, goal_title: goal.title });
            }
          }
        }
        setItems(all);
        setLoading(false);
      });
    } else {
      api.get('/action-items/client.php')
        .then(res => setItems(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  const patchStatus = async (itemId, status) => {
    await api.patch(`/action-items/status.php?id=${itemId}`, { status });
    setItems(prev => prev.map(a => a.id === itemId
      ? { ...a, status, completed_at: status === 'done' ? new Date().toISOString() : null }
      : a
    ));
  };

  const FILTERS = ['all', 'pending', 'done', 'delayed'];
  const filtered = items.filter(a => filter === 'all' || a.status === filter);
  const pending  = items.filter(a => a.status === 'pending').length;
  const done     = items.filter(a => a.status === 'done').length;
  const delayed  = items.filter(a => a.status === 'delayed').length;

  if (loading) return <div className="page-loading">Loading actions…</div>;

  return (
    <div className="page-sticky">
      {/* Fixed header */}
      <div className="page-sticky__header">
        <div>
          <h2>Actions</h2>
          <p style={{marginTop:'0.25rem', color:'var(--text-secondary)', fontSize:'0.9375rem'}}>
            {isCoach ? 'Action items across all your clients.' : 'Your assigned action items.'}
          </p>
        </div>

        <div className="stats-grid" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
          <div className="stat-card stat-card--amber">
            <div className="stat-card__top"><span className="stat-value" style={{fontSize:'2rem'}}>{pending}</span></div>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card stat-card--green">
            <div className="stat-card__top"><span className="stat-value" style={{fontSize:'2rem'}}>{done}</span></div>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card stat-card--coral">
            <div className="stat-card__top"><span className="stat-value" style={{fontSize:'2rem'}}>{delayed}</span></div>
            <span className="stat-label">Delayed</span>
          </div>
        </div>

        <div className="filter-bar">
          {FILTERS.map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="page-sticky__body">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{paddingTop:'2rem'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.75rem'}}>✅</div>
            <p style={{fontWeight:600, color:'var(--text)', marginBottom:'0.375rem'}}>No actions found.</p>
            <p style={{fontSize:'0.875rem'}}>
              {filter === 'all' ? 'No action items yet.' : `No ${filter} action items.`}
            </p>
          </div>
        ) : (
          filtered.map(action => (
            <div key={action.id} className={`action-item action-item--${action.status}`}>
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:'0.2rem'}}>
                <span className="action-item__title">{action.title}</span>
                <span style={{fontSize:'0.775rem', color:'var(--text-muted)'}}>
                  {isCoach && action.client_name && `${action.client_name} · `}
                  {action.goal_title}
                  {action.due_date && ` · Due ${action.due_date}`}
                </span>
              </div>
              <div className="action-item__controls">
                {isCoach ? (
                  <select value={action.status}
                    onChange={e => patchStatus(action.id, e.target.value)}
                    className={`status-select status-select--${STATUS_COLORS[action.status]}`}>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                    <option value="delayed">Delayed</option>
                  </select>
                ) : (
                  <span className={`badge badge--${action.status === 'done' ? 'completed' : action.status === 'delayed' ? 'rejected' : 'pending'}`}>
                    {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
