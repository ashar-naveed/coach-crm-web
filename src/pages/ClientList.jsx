import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ClientList() {
  const navigate              = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clients/index.php')
      .then(res => setClients(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const STAGE_CLASS = (stage) => {
    const map = {
      'Discovery': 'discovery',
      'Goal Setting': 'goal-setting',
      'Active Coaching': 'active-coaching',
      'Midpoint Review': 'midpoint-review',
      'Closure': 'closure',
    };
    return map[stage] || 'active';
  };

  return (
    <div className="page-sticky">
      {/* Fixed header */}
      <div className="page-sticky__header">
        <div className="page-header">
          <h2>Clients</h2>
          <button className="btn btn-primary" onClick={() => navigate('/clients/new')}>
            + New Client
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="page-sticky__body">
        {loading ? (
          <div className="page-loading">Loading clients…</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients yet. Add your first client to get started.</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="client-row" onClick={() => navigate(`/clients/${client.id}`)}>
              <div className="client-row__info">
                <span className="client-row__name">{client.name}</span>
                <span className="client-row__meta">
                  {[client.job_title, client.organization].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className="client-row__right">
                <span className={`badge badge--${STAGE_CLASS(client.lifecycle_stage)}`}>
                  {client.lifecycle_stage}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
