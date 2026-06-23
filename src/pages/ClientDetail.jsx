import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const TABS = ["Goals", "Sessions", "Context"];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState("Goals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/clients/client.php?id=${id}`)
      .then((res) => setClient(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading client…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page-sticky">
      {/* Fixed header */}
      <div className="page-sticky__header">
        <button
          className="btn btn-ghost"
          style={{ alignSelf: "flex-start" }}
          onClick={() => navigate("/clients")}
        >
          ← Clients
        </button>

        <div className="client-header">
          <div>
            <h2>{client.name}</h2>
            <p className="client-header__meta">
              {[client.job_title, client.organization]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/messages/${client.user_id}`)}
            >
              💬 Message
            </button>
            <span className="badge badge--stage">{client.lifecycle_stage}</span>
          </div>
        </div>

        <div className="profile-grid">
          {client.coaching_type && (
            <div className="profile-field">
              <label>Coaching Type</label>
              <span>{client.coaching_type}</span>
            </div>
          )}
          {client.start_date && (
            <div className="profile-field">
              <label>Start Date</label>
              <span>{client.start_date}</span>
            </div>
          )}
          {client.phone && (
            <div className="profile-field">
              <label>Phone</label>
              <span>{client.phone}</span>
            </div>
          )}
          {client.email && (
            <div className="profile-field">
              <label>Email</label>
              <span>{client.email}</span>
            </div>
          )}
        </div>

        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="page-sticky__body" style={{ paddingTop: "0.75rem" }}>
        {activeTab === "Goals" && <GoalsTab clientId={id} />}
        {activeTab === "Sessions" && <SessionsTab clientId={id} />}
        {activeTab === "Context" && (
          <ContextTab clientId={id} context={client.context} />
        )}
      </div>
    </div>
  );
}

function GoalsTab({ clientId }) {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/goals/index.php?client_id=${clientId}`)
      .then((res) => setGoals(res.data))
      .finally(() => setLoading(false));
  }, [clientId]);

  const deleteGoal = async (goalId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this goal and all its action items?")) return;
    await api.delete(`/goals/goal.php?id=${goalId}`);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  if (loading) return <div className="page-loading">Loading goals…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className="tab-header">
        <span>
          {goals.length} goal{goals.length !== 1 ? "s" : ""}
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/clients/${clientId}/goals/new`)}
        >
          + Add Goal
        </button>
      </div>
      {goals.length === 0 && <p className="empty-state">No goals yet.</p>}
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="goal-row"
          onClick={() => navigate(`/goals/${goal.id}`)}
        >
          <div className="goal-row__info">
            <span className="goal-row__title">{goal.title}</span>
            <div className="progress-bar">
              <div
                className="progress-bar__fill"
                style={{ width: `${goal.progress_percentage}%` }}
              />
            </div>
          </div>
          <div className="goal-row__right">
            <span className="goal-row__pct">{goal.progress_percentage}%</span>
            <span className={`badge badge--${goal.status}`}>{goal.status}</span>
            <button
              className="btn-delete"
              onClick={(e) => deleteGoal(goal.id, e)}
              title="Delete goal"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionsTab({ clientId }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/sessions/index.php?client_id=${clientId}`)
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div className="page-loading">Loading sessions…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div className="tab-header">
        <span>
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/sessions/new")}
        >
          + Schedule
        </button>
      </div>
      {sessions.length === 0 && <p className="empty-state">No sessions yet.</p>}
      {sessions.map((session) => (
        <div key={session.id} className="session-row">
          <div className="session-row__datetime">
            {new Date(session.session_datetime).toLocaleDateString("en-SA", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            <span className="session-row__time">
              {new Date(session.session_datetime).toLocaleTimeString("en-SA", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span className="session-row__type">{session.type}</span>
          <span className={`badge badge--${session.status}`}>
            {session.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ContextTab({ clientId, context }) {
  const [notes, setNotes] = useState(context || []);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ category: "", content: "" });
  const [saving, setSaving] = useState(false);

  const openEdit = (note) => {
    setFormData({ category: note.category, content: note.content });
    setEditing(note.category);
  };
  const openNew = () => {
    setFormData({ category: "", content: "" });
    setEditing("__new__");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/clients/context.php?id=${clientId}`, formData);
      const res = await api.get(`/clients/context.php?id=${clientId}`);
      setNotes(res.data);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (category) => {
    await api.delete(
      `/clients/context.php?id=${clientId}&category=${encodeURIComponent(category)}`,
    );
    setNotes((prev) => prev.filter((n) => n.category !== category));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className="tab-header">
        <span>Context notes</span>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          + Add
        </button>
      </div>

      {editing && (
        <div className="context-form">
          <input
            placeholder="Category (e.g. personality, motivators)"
            value={formData.category}
            onChange={(e) =>
              setFormData((f) => ({ ...f, category: e.target.value }))
            }
            readOnly={editing !== "__new__"}
          />
          <textarea
            rows={4}
            placeholder="Notes…"
            value={formData.content}
            onChange={(e) =>
              setFormData((f) => ({ ...f, content: e.target.value }))
            }
          />
          <div className="form-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 && !editing && (
        <p className="empty-state">No context notes yet.</p>
      )}

      {notes.map((note) => (
        <div key={note.category} className="context-note">
          <div className="context-note__header">
            <span className="context-note__category">{note.category}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => openEdit(note)}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => deleteNote(note.category)}
              >
                Delete
              </button>
            </div>
          </div>
          <p className="context-note__content">{note.content}</p>
        </div>
      ))}
    </div>
  );
}
