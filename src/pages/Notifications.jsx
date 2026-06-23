import { useEffect, useState } from 'react';
import { api } from '../services/api';

const getNotifType = (title) => {
  const t = title.toLowerCase();
  if (t.includes('session')) return 'session';
  if (t.includes('goal'))    return 'goal';
  if (t.includes('action'))  return 'action';
  return 'default';
};

const TYPE_DOTS = {
  session: { color: '#5C7A94', label: 'Session' },
  goal:    { color: '#4F7D61', label: 'Goal'    },
  action:  { color: '#C7923E', label: 'Action'  },
  default: { color: '#9CA3AF', label: ''         },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const load = () =>
    api.get('/notifications/index.php')
      .then(res => setNotifications(res.data))
      .catch(err => setError(err.message));

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const markOne = async (id) => {
    await api.patch(`/notifications/read.php?id=${id}`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all.php');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="page-loading">Loading notifications…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Notifications
          {unreadCount > 0 && <span className="badge badge--unread">{unreadCount}</span>}
        </h2>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {notifications.length === 0 ? (
        <p className="empty-state">No notifications.</p>
      ) : (
        <div className="notification-list">
          {notifications.map(n => {
            const type = getNotifType(n.title);
            const dot  = TYPE_DOTS[type];
            return (
              <div key={n.id} className={`notification-row ${n.is_read ? '' : 'notification-row--unread'}`}>
                <div className="notif-dot" style={{ background: dot.color }} title={dot.label} />
                <div className="notification-row__content">
                  <span className="notification-row__title">{n.title}</span>
                  <span className="notification-row__message">{n.message}</span>
                  <span className="notification-row__time">
                    {new Date(n.created_at).toLocaleDateString('en-SA', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                {!n.is_read && (
                  <button className="btn-delete" onClick={() => markOne(n.id)}>Mark read</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
