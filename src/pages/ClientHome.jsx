import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const getActivityColor = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('session')) return '#5C7A94';
  if (t.includes('action'))  return '#C7923E';
  if (t.includes('goal'))    return '#4F7D61';
  return '#9CA3AF';
};

export default function ClientHome() {
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [coach, setCoach]       = useState(null);
  const [actions, setActions]   = useState([]);
  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/sessions/index.php").catch(() => ({ data: [] })),
      api.get("/notifications/index.php").catch(() => ({ data: [] })),
      api.get("/messages/coach.php").catch(() => ({ data: [] })),
      api.get("/action-items/client.php").catch(() => ({ data: [] })),
      api.get("/goals/client.php").catch(() => ({ data: [] })),
    ]).then(([sRes, nRes, cRes, aRes, gRes]) => {
      setSessions(sRes.data || []);
      setNotifs(nRes.data || []);
      setActions(aRes.data || []);
      setGoals(gRes.data || []);
      const coaches = cRes.data || [];
      if (coaches.length > 0) setCoach(coaches[0]);
    }).finally(() => setLoading(false));
  }, []);

  const firstName    = user?.name?.split(" ")[0] || "there";
  const upcoming     = sessions
    .filter(s => ["approved", "pending"].includes(s.status))
    .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime));
  const nextSession  = upcoming[0] || null;
  const unreadNotifs = notifs.filter(n => !n.is_read).length;
  const pendingActions = actions.filter(a => a.status === 'pending').length;
  const activeGoals  = goals.filter(g => g.status === 'active');

  const formatDt = (dt) => ({
    date: new Date(dt).toLocaleDateString("en-SA", { month: "long", day: "numeric", year: "numeric" }),
    time: new Date(dt).toLocaleTimeString("en-SA", { hour: "2-digit", minute: "2-digit" }),
  });

  const nextSessionLabel = nextSession
    ? new Date(nextSession.session_datetime).toLocaleDateString('en-SA', { month: 'short', day: 'numeric' })
    : '—';

  const CARDS = [
    { label: 'Next Session',      value: nextSessionLabel, color: 'blue'   },
    { label: 'Pending Actions',   value: pendingActions,   color: 'amber'  },
    { label: 'New Notifications', value: unreadNotifs,     color: 'purple' },
  ];

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <div>
        <h2>Welcome, {firstName} 👋</h2>
        <p style={{ marginTop: "0.25rem", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Here's your coaching summary.
        </p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {CARDS.map(({ label, value, color }) => (
          <div key={label} className={`stat-card stat-card--${color}`}>
            <div className="stat-card__top">
              <span className="stat-value" style={{ fontSize: "2rem" }}>{value}</span>
            </div>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-panels">

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Next Session */}
          <div className="dashboard-panel">
            <div className="dashboard-panel__header">
              <div className="dashboard-panel__title">
                <span style={{ fontSize: "1.1rem" }}>📅</span>
                <h3>Next Session</h3>
              </div>
            </div>
            {nextSession ? (() => {
              const { date, time } = formatDt(nextSession.session_datetime);
              return (
                <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)" }}>{date}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{time}</div>
                  {coach && <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Coach: {coach.name}</div>}
                  <div style={{ marginTop: "0.25rem" }}>
                    <span className={`badge badge--${nextSession.status}`}>{nextSession.status}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm"
                    style={{ marginTop: "0.5rem", alignSelf: "flex-start" }}
                    onClick={() => navigate("/sessions")}>
                    View Sessions →
                  </button>
                </div>
              );
            })() : (
              <div style={{ padding: "1.25rem 1.5rem" }}>
                <p style={{ fontWeight: 500, color: "var(--text)", marginBottom: "0.375rem" }}>No upcoming sessions.</p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  Your coach will notify you when a new session is scheduled.
                </p>
              </div>
            )}
          </div>

          {/* Active Action Items */}
          <div className="dashboard-panel">
            <div className="dashboard-panel__header">
              <div className="dashboard-panel__title">
                <span style={{ fontSize: "1.1rem" }}>⚡</span>
                <h3>Active Action Items</h3>
              </div>
              <button className="dashboard-panel__link" onClick={() => navigate("/actions")}>
                View all →
              </button>
            </div>
            {actions.filter(a => a.status === 'pending').length === 0 ? (
              <div style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No pending action items.
              </div>
            ) : (
              <div className="dashboard-activity-list">
                {actions.filter(a => a.status === 'pending').slice(0, 4).map(a => (
                  <div key={a.id} className="dashboard-activity-row">
                    <span className="dashboard-activity-dot" style={{ background: 'var(--warning)' }} />
                    <div style={{ flex: 1 }}>
                      <div className="dashboard-activity-text">{a.title}</div>
                      {a.due_date && (
                        <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Due {a.due_date}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Active Goals */}
          <div className="dashboard-panel">
            <div className="dashboard-panel__header">
              <div className="dashboard-panel__title">
                <span style={{ fontSize: "1.1rem" }}>🎯</span>
                <h3>Active Goals</h3>
              </div>
              <button className="dashboard-panel__link" onClick={() => navigate("/goals")}>
                View all →
              </button>
            </div>
            {activeGoals.length === 0 ? (
              <div style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No active goals yet.
              </div>
            ) : (
              <div style={{ padding: "0.5rem 0" }}>
                {activeGoals.slice(0, 3).map(goal => (
                  <div key={goal.id} style={{ padding: "0.875rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.4rem" }}>{goal.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ flex: 1, height: "6px", background: "#EEEBE4", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${goal.progress_percentage}%`, background: "linear-gradient(90deg, var(--primary), var(--primary-light))", borderRadius: "100px" }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--primary-dark)", flexShrink: 0 }}>
                        {goal.progress_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-panel">
            <div className="dashboard-panel__header">
              <div className="dashboard-panel__title">
                <span style={{ fontSize: "1.1rem" }}>🔔</span>
                <h3>Recent Activity</h3>
              </div>
              <button className="dashboard-panel__link" onClick={() => navigate("/notifications")}>
                View all →
              </button>
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No recent activity.
              </div>
            ) : (
              <div className="dashboard-activity-list">
                {notifs.slice(0, 5).map(n => (
                  <div key={n.id} className="dashboard-activity-row">
                    <span className="dashboard-activity-dot" style={{ background: getActivityColor(n.title) }} />
                    <div style={{ flex: 1 }}>
                      <div className="dashboard-activity-text" style={{ fontWeight: 500 }}>{n.title}</div>
                      <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                        {new Date(n.created_at).toLocaleDateString("en-SA", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
