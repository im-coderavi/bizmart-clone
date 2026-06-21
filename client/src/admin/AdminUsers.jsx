import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminUsers() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [plans, setPlans] = useState([]);
  const [mgmt, setMgmt] = useState(null); // user whose membership is being managed

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
  const remove = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); load(); }
    catch (err) { alert(err.uiMessage); }
  };

  const fmt = (u) => {
    if (!u.membership?.isActive) return "—";
    const exp = u.membership.expiresAt;
    return exp ? `till ${new Date(exp).toLocaleDateString()}` : "Lifetime";
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
                  <td>
                    {u.membership?.isActive ? (
                      <span className="badge-green">Active</span>
                    ) : (
                      <span className="muted">None</span>
                    )}
                    <br /><small className="muted">{fmt(u)}</small>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <button onClick={() => setMgmt(u)}>Membership</button>
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

      {mgmt && (
        <MembershipModal
          user={mgmt}
          plans={plans}
          onClose={() => setMgmt(null)}
          onDone={() => { setMgmt(null); load(); }}
        />
      )}
    </div>
  );
}

function MembershipModal({ user, plans, onClose, onDone }) {
  const [planId, setPlanId] = useState(plans[0]?._id || "");
  const [mode, setMode] = useState("plan");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const active = user.membership?.isActive;
  const exp = user.membership?.expiresAt;

  const grant = async () => {
    if (!planId) return setError("Select a plan");
    setBusy(true); setError("");
    try {
      await api.put(`/admin/users/${user._id}/membership`, { planId, mode, days: Number(days) });
      onDone();
    } catch (err) { setError(err.uiMessage); setBusy(false); }
  };

  const revoke = async () => {
    if (!confirm(`Revoke ${user.name}'s membership?`)) return;
    setBusy(true); setError("");
    try {
      await api.delete(`/admin/users/${user._id}/membership`);
      onDone();
    } catch (err) { setError(err.uiMessage); setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Membership — {user.name}</h2>
        <p className="muted" style={{ marginTop: -8 }}>{user.email}</p>

        <div className="membership-current">
          Current:{" "}
          {active ? (
            <b className="badge-green">Active{exp ? ` (till ${new Date(exp).toLocaleDateString()})` : " — Lifetime"}</b>
          ) : (
            <b>None</b>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <label>
          Plan
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
            ))}
          </select>
        </label>

        <label>
          Duration
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="plan">Use plan's duration</option>
            <option value="lifetime">Lifetime (never expires)</option>
            <option value="custom">Custom days</option>
          </select>
        </label>

        {mode === "custom" && (
          <label>
            Days
            <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
          </label>
        )}

        <div className="form-actions">
          <button className="btn-primary" disabled={busy} onClick={grant}>
            {busy ? "..." : active ? "Update / Extend" : "Grant Membership"}
          </button>
          {active && (
            <button className="btn-outline" disabled={busy} onClick={revoke}>Revoke</button>
          )}
          <button className="btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
