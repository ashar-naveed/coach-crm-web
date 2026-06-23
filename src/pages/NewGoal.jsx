import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function NewGoal() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    success_definition: "",
    timeline_months: "",
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/goals/index.php`, {
        ...form,
        client_id: parseInt(clientId),
        timeline_months: form.timeline_months
          ? parseInt(form.timeline_months)
          : undefined,
      });
      navigate(`/clients/${clientId}`);
    } catch (err) {
      setError(err.message || "Failed to create goal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <button
        className="btn btn-ghost"
        onClick={() => navigate(`/clients/${clientId}`)}
      >
        ← Client
      </button>

      <div className="page-header">
        <h2>New Goal</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="notes-form">
        <div className="form-group">
          <label>Goal Title *</label>
          <input
            placeholder="Improve delegation skills"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={3}
            placeholder="What does this goal involve?"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Success Definition</label>
          <textarea
            rows={3}
            placeholder="How will we know this goal is achieved?"
            value={form.success_definition}
            onChange={(e) => set("success_definition", e.target.value)}
          />
        </div>

        <div className="form-group form-group--sm">
          <label>Timeline (months)</label>
          <input
            type="number"
            min="1"
            placeholder="6"
            value={form.timeline_months}
            onChange={(e) => set("timeline_months", e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Creating…" : "Create Goal"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate(`/clients/${clientId}`)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
