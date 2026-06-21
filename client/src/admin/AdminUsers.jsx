import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminUsers() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [plans, setPlans] = useState([]);

  const load = () => {
    setLoading(true);
    api.get("/admin/users", { params: { search, page, limit: 15 } })
      .then((r) => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, [page]);
  useEffect(() => { api.get("/admin/plans").then((r) => setPlans(r.data.items)); }, []);
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(); }, 300); return () => clearTimeout(t); }, [search]);

  const toggleBlock = async (u) => {
    await api.put(`/admin/users/${u._id}`, { isBlocked: !u.isBlocked });
    load();
  };
  const toggleRole = async (u) => {
    await api.put(`/admin/users/${u._id}`, { role: u.role === "admin" ? "user" : "admin" });
    load();
  };
  const grant = async (u) => {
    const lifetime = plans.find((p) => p.billingType === "lifetime") || plans[0];
    if (!lifetime) return alert("Create a plan first");
    if (!confirm(`Grant "${lifetime.name}" to ${u.name}?`)) return;
    await api.put(`/admin/users/${u._id}/membership`, { planId: lifetime._id });
    load();
  };
  const remove = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); load(); }
    catch (err) { alert(err.uiMessage); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Users <small>({data.total})</small></h1>
      </div>
      <input className="admin-search" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Membership</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u._id} className={u.isBlocked ? "blocked-row" : ""}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`pill-status ${u.role}`}>{u.role}</span></td>
                  <td>{u.membership?.isActive ? <span className="badge-green">Active</span> : "—"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <button onClick={() => grant(u)}>Grant</button>
                    <button onClick={() => toggleRole(u)}>{u.role === "admin" ? "Demote" : "Promote"}</button>
                    <button onClick={() => toggleBlock(u)}>{u.isBlocked ? "Unblock" : "Block"}</button>
                    <button onClick={() => remove(u)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={6} className="muted">No users.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {data.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <button key={n} className={n === page ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
          ))}
        </div>
      )}
    </div>
  );
}
