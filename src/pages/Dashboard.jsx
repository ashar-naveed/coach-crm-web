import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const ICONS = {
  users: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  check: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  target: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  flag: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  lightning: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  calendar: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  bell: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  calIcon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  activity: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

const CARDS = [
  {
    key: "active_clients",
    label: "Active Clients",
    color: "blue",
    icon: "users",
  },
  {
    key: "completed_engagements",
    label: "Completed Engagements",
    color: "green",
    icon: "check",
  },
  {
    key: "active_goals",
    label: "Active Goals",
    color: "amber",
    icon: "target",
  },
  {
    key: "completed_goals",
    label: "Goals Completed",
    color: "teal",
    icon: "flag",
  },
  {
    key: "pending_action_items",
    label: "Pending Actions",
    color: "coral",
    icon: "lightning",
  },
  {
    key: "upcoming_sessions",
    label: "Upcoming Sessions",
    color: "purple",
    icon: "calendar",
  },
  {
    key: "unread_notifications",
    label: "Unread Notifications",
    color: "gray",
    icon: "bell",
  },
];

const ACTIVITY_COLORS = {
  session: "#5C7A94",
  goal: "#4F7D61",
  action: "#C7923E",
  default: "#9CA3AF",
};

const getActivityColor = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("session")) return ACTIVITY_COLORS.session;
  if (t.includes("goal")) return ACTIVITY_COLORS.goal;
  if (t.includes("action")) return ACTIVITY_COLORS.action;
  return ACTIVITY_COLORS.default;
};

const formatActivityTime = (dt) => {
  const d = new Date(dt);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("en-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-SA", { month: "short", day: "numeric" });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/index.php").then((r) => setData(r.data)),
      api
        .get("/sessions/index.php?status=approved")
        .then((r) => setSessions(r.data.slice(0, 3))),
      api
        .get("/notifications/index.php")
        .then((r) => setNotifs(r.data.slice(0, 4))),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;

  const firstName = user?.name?.split(" ")[0] || "Coach";

  const formatSessionDate = (dt) => {
    const d = new Date(dt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-SA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSessionTime = (dt) =>
    new Date(dt).toLocaleTimeString("en-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMonthDay = (dt) => {
    const d = new Date(dt);
    return {
      month: d.toLocaleDateString("en-SA", { month: "short" }).toUpperCase(),
      day: d.getDate(),
    };
  };

  return (
    <div className="page">
      <div>
        <h2>Dashboard</h2>
        <p
          style={{
            marginTop: "0.25rem",
            color: "var(--text-secondary)",
            fontSize: "0.9375rem",
          }}
        >
          Welcome back, {firstName} 👋
        </p>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {CARDS.map(({ key, label, color, icon }) => (
          <div key={key} className={`stat-card stat-card--${color}`}>
            <div className="stat-card__top">
              <span className="stat-value">{data[key]}</span>
              <span className="stat-icon">{ICONS[icon]}</span>
            </div>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Bottom two panels */}
      <div className="dashboard-panels">
        {/* Upcoming Sessions */}
        <div className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title">
              <span
                className="dashboard-panel__icon"
                style={{ color: "var(--primary)" }}
              >
                {ICONS.calIcon}
              </span>
              <h3>Upcoming Sessions</h3>
            </div>
            <button
              className="dashboard-panel__link"
              onClick={() => navigate("/sessions")}
            >
              View all sessions →
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="empty-state" style={{ padding: "1.5rem" }}>
              No upcoming sessions.
            </p>
          ) : (
            <div className="dashboard-session-list">
              {sessions.map((s) => {
                const { month, day } = getMonthDay(s.session_datetime);
                return (
                  <div key={s.id} className="dashboard-session-row">
                    <div className="dashboard-session-date">
                      <span className="dashboard-session-month">{month}</span>
                      <span className="dashboard-session-day">{day}</span>
                    </div>
                    <div className="dashboard-session-info">
                      <span className="dashboard-session-name">
                        {s.client_name}
                      </span>
                      <span className="dashboard-session-time">
                        {formatSessionDate(s.session_datetime)} ·{" "}
                        {formatSessionTime(s.session_datetime)}
                      </span>
                    </div>
                    <span
                      className={`badge badge--${s.type === "online" ? "approved" : "active"}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {s.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div className="dashboard-panel__title">
              <span
                className="dashboard-panel__icon"
                style={{ color: "var(--warning)" }}
              >
                {ICONS.activity}
              </span>
              <h3>Recent Activity</h3>
            </div>
            <button
              className="dashboard-panel__link"
              onClick={() => navigate("/notifications")}
            >
              View all activity →
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="empty-state" style={{ padding: "1.5rem" }}>
              No recent activity.
            </p>
          ) : (
            <div className="dashboard-activity-list">
              {notifications.map((n) => (
                <div key={n.id} className="dashboard-activity-row">
                  <span
                    className="dashboard-activity-dot"
                    style={{ background: getActivityColor(n.title) }}
                  />
                  <span className="dashboard-activity-text">{n.message}</span>
                  <span className="dashboard-activity-time">
                    {formatActivityTime(n.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
