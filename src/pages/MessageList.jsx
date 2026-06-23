import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function MessageList() {
  const navigate              = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clients/index.php')
      .then(res => setClients(res.data))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.organization || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading conversations…</div>;

  return (
    <div className="page">
      <div>
        <h2>Messages</h2>
        <p style={{marginTop:'0.25rem', color:'var(--text-secondary)', fontSize:'0.9375rem'}}>
          Stay connected with your coach.
        </p>
      </div>

      <input
        className="search-input"
        placeholder="Search conversations…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="empty-state" style={{paddingTop:'4rem'}}>
          <div style={{fontSize:'2.5rem', marginBottom:'0.75rem'}}>💬</div>
          <p style={{fontWeight:600, color:'var(--text)', marginBottom:'0.375rem'}}>No conversations yet.</p>
          <p style={{fontSize:'0.875rem'}}>Your coach will be able to message you here.</p>
        </div>
      ) : (
        <div className="message-list">
          {filtered.map(client => (
            <div key={client.id} className="message-list-row"
              onClick={() => navigate(`/messages/${client.user_id}`)}>
              <div className="message-list-avatar">{client.name.charAt(0).toUpperCase()}</div>
              <div className="message-list-info">
                <span className="message-list-name">{client.name}</span>
                <span className="message-list-meta">
                  {[client.job_title, client.organization].filter(Boolean).join(' · ')}
                </span>
              </div>
              <span className="message-list-arrow">→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
