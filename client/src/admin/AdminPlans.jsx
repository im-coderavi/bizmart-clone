import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

const emptyPlan = {
  name: "", billingType: "lifetime", price: 0, originalPrice: 0,
  durationDays: 0, description: "", features: [], isPopular: false, isActive: true,
};

export default function AdminPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/plans").then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm(emptyPlan); setEditing({}); };
  const openEdit = (p) => { setForm({ ...emptyPlan, ...p }); setEditing(p); };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      durationDays: Number(form.durationDays),
      features: Array.isArray(form.features) ? form.features : String(form.features).split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing._id) await api.put(`/admin/plans/${editing._id}`, payload);
      else await api.post("/admin/plans", payload);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.uiMessage);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete plan "${p.name}"?`)) return;
    await api.delete(`/admin/plans/${p._id}`);
    load();
  };

  const featuresText = Array.isArray(form.features) ? form.features.join("\n") : form.features;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Membership Plans</h1>
        <button className="btn-primary" onClick={openNew}>+ Add Plan</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Price</th><th>Duration</th><th>Popular</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.billingType}</td>
                  <td>₹{p.price}</td>
                  <td>{p.durationDays ? `${p.durationDays} days` : "Lifetime"}</td>
                  <td>{p.isPopular ? "⭐" : "—"}</td>
                  <td>{p.isActive ? "✅" : "❌"}</td>
                  <td className="row-actions">
                    <button onClick={() => openEdit(p)}>Edit</button>
                    <button onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="modal wide" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{editing._id ? "Edit" : "Add"} Plan</h2>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-grid">
              <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Billing Type
                <select value={form.billingType} onChange={(e) => setForm({ ...form, billingType: e.target.value })}>
                  <option value="lifetime">Lifetime</option>
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <label>Price ₹<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
              <label>Original Price ₹<input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} /></label>
              <label>Duration (days, 0=lifetime)<input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} /></label>
              <label>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label className="full">Features (one per line)
                <textarea rows={5} value={featuresText} onChange={(e) => setForm({ ...form, features: e.target.value })} />
              </label>
              <label className="checkbox"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} /> Most Popular</label>
              <label className="checkbox"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            </div>
            <div className="form-actions">
              <button className="btn-primary">Save</button>
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
