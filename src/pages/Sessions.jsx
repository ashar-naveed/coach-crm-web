import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STATUS_FILTERS = ['all', 'approved', 'pending', 'completed', 'cancelled'];

export default function Sessions() {
  const navigate                = useNavigate();
  const { user }                = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const isCoach = user?.role === 'coach' || user?.role === 'admin';

  const load = (status) => {
    setLoading(true);
    const qs = status !== 'all' ? `?status=${status}` : '';
    api.get(`/sessions/index.php${qs}`)
      .then(res => setSessions(res.data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const transition = async (sessionId, action) => {
    await api.patch(`/sessions/${action}.php?id=${sessionId}`);
    load(filter);
  };

  return (
    <div className="page-sticky">
      {/* Fixed header */}
      <div className="page-sticky__header">
        <div className="page-header">
          <h2>Sessions</h2>
          {isCoach && (
            <button className="btn btn-primary" onClick={() => navigate('/sessions/new')}>
              + Schedule Session
            </button>
          )}
        </div>
        <div className="filter-bar">
          {STATUS_FILTERS.map(s => (
            <button key={s}
              className={`filter-btn ${filter === s ? 'filter-btn--active' : ''}`}
              onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable session list */}
      <div className="page-sticky__body">
        {loading ? (
          <div className="page-loading">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state" style={{paddingTop:'3rem'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.75rem'}}>📅</div>
            <p style={{fontWeight:600, color:'var(--text)', marginBottom:'0.375rem'}}>No sessions found.</p>
            <p style={{fontSize:'0.875rem'}}>
              {isCoach ? 'Schedule a session to get started.' : 'Your coach will schedule sessions for you here.'}
            </p>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-card__top">
                <div className="session-card__datetime">
                  <span className="session-card__date">
                    {new Date(session.session_datetime).toLocaleDateString('en-SA', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <span className="session-card__time">
                    {new Date(session.session_datetime).toLocaleTimeString('en-SA', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <span className={`badge badge--${session.status}`}>{session.status}</span>
              </div>

              <div className="session-card__client"
                onClick={(e) => { if (isCoach) { e.stopPropagation(); navigate(`/clients/${session.client_profile_id}`); } }}
                style={{ cursor: isCoach ? 'pointer' : 'default' }}>
                {isCoach ? `${session.client_name} ↗` : session.coach_name}
              </div>

              <div className="session-card__meta">
                <span>{session.duration_minutes} min</span>
                <span>·</span>
                <span>{session.type}</span>
                {session.meeting_link && (
                  <><span>·</span><a href={session.meeting_link} target="_blank" rel="noreferrer">Join</a></>
                )}
              </div>

              {isCoach && (
                <div className="session-card__actions">
                  {session.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => transition(session.id, 'approve')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => transition(session.id, 'reject')}>Reject</button>
                    </>
                  )}
                  {session.status === 'approved' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => transition(session.id, 'complete')}>Mark Complete</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => transition(session.id, 'cancel')}>Cancel</button>
                    </>
                  )}
                  {session.status === 'completed' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/sessions/${session.id}/notes`)}>View Notes</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
