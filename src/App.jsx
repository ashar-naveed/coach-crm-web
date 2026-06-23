import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import logo from "./assets/mumkin-logo.png";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import GoalDetail from "./pages/GoalDetail";
import Sessions from "./pages/Sessions";
import SessionNotes from "./pages/SessionNotes";
import MessagesLayout from "./pages/MessagesLayout";
import Notifications from "./pages/Notifications";
import NewClient from "./pages/NewClient";
import NewGoal from "./pages/NewGoal";
import NewSession from "./pages/NewSession";
import ClientHome from "./pages/ClientHome";
import Profile from "./pages/Profile";
import Actions from "./pages/Actions";
import ClientGoals from "./pages/ClientGoals";

function Protected({ children, coachOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (coachOnly && user.role === "client")
    return <Navigate to="/client-home" replace />;
  return children;
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchCounts = () => {
      api
        .get("/notifications/index.php")
        .then((res) =>
          setUnreadCount((res.data || []).filter((n) => !n.is_read).length),
        )
        .catch(() => {});
      api
        .get("/messages/unread-count.php")
        .then((res) => setUnreadMessages(res.data?.count || 0))
        .catch(() => {});
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    window.addEventListener("focus", fetchCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchCounts);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isCoach = user?.role === "coach" || user?.role === "admin";

  const NAV = isCoach
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/clients", label: "Clients" },
        { to: "/sessions", label: "Sessions" },
        { to: "/actions", label: "Actions" },
      ]
    : [
        { to: "/client-home", label: "Home" },
        { to: "/sessions", label: "Sessions" },
        { to: "/actions", label: "Actions" },
        { to: "/goals", label: "Goals" },
      ];

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar__brand">
          <img src={logo} alt="Mumkin" className="sidebar__logo" />
          <span>CoachCRM</span>
        </div>
        <ul className="sidebar__nav">
          {NAV.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar__left" />
          <div className="topbar__right">
            {/* Messages icon with badge */}
            <button
              className="topbar__icon-btn"
              onClick={() => navigate("/messages")}
              title="Messages"
              style={{ position: "relative" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {unreadMessages > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "16px",
                    height: "16px",
                    background: "var(--primary)",
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>

            {/* Notifications icon with badge */}
            <button
              className="topbar__icon-btn"
              onClick={() => navigate("/notifications")}
              title="Notifications"
              style={{ position: "relative" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "16px",
                    height: "16px",
                    background: "var(--danger)",
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="topbar__profile-wrap">
              <button
                className="topbar__profile-btn"
                onClick={() => setShowProfile((p) => !p)}
              >
                <div className="topbar__avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="topbar__username">
                  {user?.name?.split(" ")[0]}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showProfile && (
                <div className="topbar__dropdown">
                  <div className="topbar__dropdown-header">
                    <div className="topbar__avatar topbar__avatar--lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="topbar__dropdown-name">{user?.name}</div>
                      <div className="topbar__dropdown-email">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="topbar__dropdown-divider" />
                  <button
                    className="topbar__dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setShowProfile(false);
                    }}
                  >
                    👤 My Profile
                  </button>
                  <div className="topbar__dropdown-divider" />
                  <button
                    className="topbar__dropdown-item topbar__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={`main-content${location.pathname.startsWith("/messages") ? " main-content--messages" : ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Protected coachOnly>
                <Layout>
                  <Dashboard />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/clients"
            element={
              <Protected coachOnly>
                <Layout>
                  <ClientList />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/clients/new"
            element={
              <Protected coachOnly>
                <Layout>
                  <NewClient />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <Protected coachOnly>
                <Layout>
                  <ClientDetail />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/clients/:clientId/goals/new"
            element={
              <Protected coachOnly>
                <Layout>
                  <NewGoal />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/goals/:id"
            element={
              <Protected coachOnly>
                <Layout>
                  <GoalDetail />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/sessions"
            element={
              <Protected>
                <Layout>
                  <Sessions />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/sessions/new"
            element={
              <Protected coachOnly>
                <Layout>
                  <NewSession />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/sessions/:id/notes"
            element={
              <Protected>
                <Layout>
                  <SessionNotes />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/messages"
            element={
              <Protected>
                <Layout>
                  <MessagesLayout />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <Protected>
                <Layout>
                  <MessagesLayout />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/notifications"
            element={
              <Protected>
                <Layout>
                  <Notifications />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <Layout>
                  <Profile />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/client-home"
            element={
              <Protected>
                <Layout>
                  <ClientHome />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/actions"
            element={
              <Protected>
                <Layout>
                  <Actions />
                </Layout>
              </Protected>
            }
          />
          <Route
            path="/goals"
            element={
              <Protected>
                <Layout>
                  <ClientGoals />
                </Layout>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
