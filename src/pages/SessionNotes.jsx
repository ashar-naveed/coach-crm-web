import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const FIELDS = [
  { key: "key_insights", label: "Key Insights", required: true },
  { key: "decisions", label: "Decisions", required: false },
  { key: "commitments", label: "Commitments", required: false },
  { key: "coach_observations", label: "Coach Observations", required: false },
  { key: "next_focus", label: "Next Session Focus", required: false },
];

export default function SessionNotes() {
  const { id } = useParams(); // session id
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/session-notes/index.php?session_id=${id}`)
      .then((res) => {
        setNote(res.data);
        if (res.data) {
          const initial = {};
          FIELDS.forEach((f) => {
            initial[f.key] = res.data[f.key] || "";
          });
          setForm(initial);
        } else {
          // No note yet — open blank form immediately
          const blank = {};
          FIELDS.forEach((f) => {
            blank[f.key] = "";
          });
          setForm(blank);
          setEditing(true);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (note) {
        await api.put(`/session-notes/index.php?session_id=${id}`, form);
      } else {
        await api.post(`/session-notes/index.php?session_id=${id}`, form);
      }
      const res = await api.get(`/session-notes/index.php?session_id=${id}`);
      setNote(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (note) {
      FIELDS.forEach((f) => {
        form[f.key] = note[f.key] || "";
      });
      setEditing(false);
    } else {
      navigate(-1);
    }
  };

  if (loading) return <div className="page-loading">Loading notes…</div>;

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>
        ← Session
      </button>

      <div className="page-header">
        <h2>Session Notes</h2>
        {note && !editing && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {editing ? (
        <div className="notes-form">
          {FIELDS.map(({ key, label, required }) => (
            <div key={key} className="form-group">
              <label>
                {label}
                {required && <span className="required"> *</span>}
              </label>
              <textarea
                rows={4}
                value={form[key] || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                placeholder={`Enter ${label.toLowerCase()}…`}
              />
            </div>
          ))}

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving || !form.key_insights?.trim()}
            >
              {saving ? "Saving…" : note ? "Update Notes" : "Save Notes"}
            </button>
            <button className="btn btn-ghost" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="notes-view">
          {FIELDS.map(({ key, label }) =>
            note[key] ? (
              <div key={key} className="note-field">
                <h4>{label}</h4>
                <p>{note[key]}</p>
              </div>
            ) : null,
          )}
          <p className="note-meta">
            Written{" "}
            {new Date(note.created_at).toLocaleDateString("en-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
