import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const STATUS_COLORS = { pending: "amber", done: "green", delayed: "coral" };

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [actions, setActions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logForm, setLogForm] = useState({ progress_percentage: "", confidence_level: "", behavior_notes: "" });
  const [savingLog, setSavingLog] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [addingAction, setAddingAction] = useState(false);

  const load = () =>
    Promise.all([
      api.get(`/goals/goal.php?id=${id}`).then((r) => setGoal(r.data)),
      api.get(`/action-items/index.php?goal_id=${id}`).then((r) => setActions(r.data)),
      api.get(`/progress-logs/index.php?goal_id=${id}`).then((r) => setLogs(r.data)),
    ]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);

  const patchStatus = async (actionId, status) => {
    await api.patch(`/action-items/status.php?id=${actionId}`, { status });
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status, completed_at: status === "done" ? new Date().toISOString() : null } : a));
  };

  const deleteAction = async (actionId) => {
    await api.delete(`/action-items/item.php?id=${actionId}`);
    setActions((prev) => prev.filter((a) => a.id !== actionId));
  };

  const deleteGoal = async () => {
    if (!confirm("Delete this goal? All action items and progress logs will also be deleted.")) return;
    await api.delete(`/goals/goal.php?id=${id}`);
    navigate(-1);
  };

  const addAction = async () => {
    if (!newAction.trim()) return;
    setAddingAction(true);
    try {
      await api.post(`/action-items/index.php`, { goal_id: parseInt(id), title: newAction });
      const res = await api.get(`/action-items/index.php?goal_id=${id}`);
      setActions(res.data);
      setNewAction("");
    } finally {
      setAddingAction(false);
    }
  };

  const deleteLog = async (logId) => {
    await api.delete(`/progress-logs/log.php?id=${logId}`);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const submitLog = async () => {
    setSavingLog(true);
    try {
      await api.post(`/progress-logs/index.php`, {
        goal_id: parseInt(id),
        progress_percentage: parseInt(logForm.progress_percentage),
        confidence_level: parseInt(logForm.confidence_level),
        behavior_notes: logForm.behavior_notes || undefined,
      });
      const [goalRes, logRes] = await Promise.all([
        api.get(`/goals/goal.php?id=${id}`),
        api.get(`/progress-logs/index.php?goal_id=${id}`),
      ]);
      setGoal(goalRes.data);
      setLogs(logRes.data);
      setLogForm({ progress_percentage: "", confidence_level: "", behavior_notes: "" });
    } finally {
      setSavingLog(false);
    }
  };

  if (loading) return <div className="page-loading">Loading goal…</div>;
  if (!goal) return <div className="alert alert-error">Goal not found</div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn btn-ghost btn-sm" style={{color:'var(--text-muted)'}} onClick={deleteGoal}>Delete Goal</button>
      </div>

      <div className="goal-header">
        <h2>{goal.title}</h2>
        <span className={`badge badge--${goal.status}`}>{goal.status}</span>
      </div>

      {goal.description && <p className="goal-description">{goal.description}</p>}

      <div className="progress-section">
        <div className="progress-bar progress-bar--large">
          <div className="progress-bar__fill" style={{ width: `${goal.progress_percentage}%` }} />
        </div>
        <span className="progress-pct">{goal.progress_percentage}%</span>
      </div>

      <section className="section">
        <h3>Action Items</h3>
        <div className="action-list">
          {actions.map((action) => (
            <div key={action.id} className={`action-item action-item--${action.status}`}>
              <span className="action-item__title">{action.title}</span>
              <div className="action-item__controls">
                {action.due_date && <span className="action-item__due">{action.due_date}</span>}
                <select
                  value={action.status}
                  onChange={(e) => patchStatus(action.id, e.target.value)}
                  className={`status-select status-select--${STATUS_COLORS[action.status]}`}
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="delayed">Delayed</option>
                </select>
                <button className="btn-delete" onClick={() => deleteAction(action.id)} title="Delete">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="add-action">
          <input
            placeholder="New action item…"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAction()}
          />
          <button className="btn btn-primary btn-sm" onClick={addAction} disabled={addingAction}>Add</button>
        </div>
      </section>

      <section className="section">
        <h3>Progress History</h3>
        {logs.length > 0 && (
          <div className="progress-timeline">
            {logs.map((log) => (
              <div key={log.id} className="timeline-entry">
                <div className="timeline-entry__meta">
                  <span className="timeline-entry__date">
                    {new Date(log.created_at).toLocaleDateString("en-SA", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="timeline-entry__pct">{log.progress_percentage}%</span>
                  {log.confidence_level && (
                    <span className="timeline-entry__confidence">Confidence: {log.confidence_level}/10</span>
                  )}
                  <button className="btn-delete" onClick={() => deleteLog(log.id)} title="Delete entry">✕</button>
                </div>
                {log.behavior_notes && <p className="timeline-entry__notes">{log.behavior_notes}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="log-form">
          <h4>Log Progress</h4>
          <div className="log-form__row">
            <div className="form-group form-group--sm">
              <label>Progress %</label>
              <input type="number" min="0" max="100" placeholder="0–100"
                value={logForm.progress_percentage}
                onChange={(e) => setLogForm((f) => ({ ...f, progress_percentage: e.target.value }))}
              />
            </div>
            <div className="form-group form-group--sm">
              <label>Confidence</label>
              <input type="number" min="1" max="10" placeholder="1–10"
                value={logForm.confidence_level}
                onChange={(e) => setLogForm((f) => ({ ...f, confidence_level: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={2} value={logForm.behavior_notes}
              onChange={(e) => setLogForm((f) => ({ ...f, behavior_notes: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={submitLog}
            disabled={savingLog || !logForm.progress_percentage || !logForm.confidence_level}>
            {savingLog ? "Saving…" : "Log Progress"}
          </button>
        </div>
      </section>
    </div>
  );
}
