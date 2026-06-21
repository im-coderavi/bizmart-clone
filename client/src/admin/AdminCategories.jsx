import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} | category
  const [form, setForm] = useState({ name: "", description: "", icon: "" });
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/categories").then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm({ name: "", description: "", icon: "" }); setEditing({}); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description, icon: c.icon }); setEditing(c); };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing._id) await api.put(`/admin/categories/${editing._id}`, form);
      else await api.post("/admin/categories", form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.uiMessage);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${c._id}`);
      load();
    } catch (err) {
      alert(err.uiMessage);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Categories</h1>
        <button className="btn-primary" onClick={openNew}>+ Add Category</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>{c.icon} {c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.productCount}</td>
                  <td className="row-actions">
                    <button onClick={() => openEdit(c)}>Edit</button>
                    <button onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{editing._id ? "Edit" : "Add"} Category</h2>
            {error && <div className="auth-error">{error}</div>}
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Icon (emoji)<input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
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
