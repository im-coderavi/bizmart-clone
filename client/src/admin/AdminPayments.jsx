import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

const STATUSES = ["pending", "", "paid", "rejected", "created", "refunded"];

export default function AdminPayments() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [proof, setProof] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/payments", { params: { status, page, limit: 25 } })
      .then((r) => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [status, page]);

  const approve = async (p) => {
    if (!confirm(`Approve ₹${p.amount} from ${p.user?.name} and activate membership?`)) return;
    setBusy(p._id);
    try {
      await api.put(`/admin/payments/${p._id}/approve`);
      load();
    } catch (err) {
      alert(err.uiMessage);
    } finally {
      setBusy(null);
    }
  };

  const reject = async (p) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    setBusy(p._id);
    try {
      await api.put(`/admin/payments/${p._id}/reject`, { reason });
      load();
    } catch (err) {
      alert(err.uiMessage);
    } finally {
      setBusy(null);
    }
  };

  const refund = async (p) => {
    const reason = prompt("Refund reason:");
    if (reason === null) return;
    await api.put(`/admin/payments/${p._id}/refund`, { reason });
    load();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Payments <small>({data.total})</small></h1>
        <select className="admin-search small" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s : "All statuses"}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Item</th><th>Amount</th><th>UTR</th><th>Proof</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td>{p.user?.name || "—"}<br /><small className="muted">{p.user?.email}</small></td>
                  <td>
                    {p.kind === "product" ? p.product?.name : p.plan?.name || "—"}
                    <br /><small className="muted">{p.kind === "product" ? "Single product" : "Membership"}</small>
                  </td>
                  <td>₹{p.amount}</td>
                  <td>{p.utr || "—"}</td>
                  <td>
                    {p.screenshot ? (
                      <button className="link-btn" onClick={() => setProof(p)}>View</button>
                    ) : "—"}
                  </td>
                  <td><span className={`pill-status ${p.status}`}>{p.status}</span></td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="row-actions">
                    {p.status === "pending" && (
                      <>
                        <button disabled={busy === p._id} onClick={() => approve(p)}>Approve</button>
                        <button disabled={busy === p._id} onClick={() => reject(p)}>Reject</button>
                      </>
                    )}
                    {p.status === "paid" && <button onClick={() => refund(p)}>Refund</button>}
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={8} className="muted">No payments.</td></tr>}
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

      {proof && (
        <div className="modal-overlay" onClick={() => setProof(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Payment Proof</h2>
            <p><b>User:</b> {proof.user?.name} ({proof.user?.email})</p>
            <p><b>Amount:</b> ₹{proof.amount} · <b>UTR:</b> {proof.utr || "—"}</p>
            <a href={proof.screenshot} target="_blank" rel="noreferrer">
              <img className="preview" style={{ maxWidth: "100%" }} src={proof.screenshot} alt="proof" />
            </a>
            <div className="form-actions">
              {proof.status === "pending" && (
                <>
                  <button className="btn-primary" onClick={() => { approve(proof); setProof(null); }}>Approve</button>
                  <button className="btn-outline" onClick={() => { reject(proof); setProof(null); }}>Reject</button>
                </>
              )}
              <button className="btn-outline" onClick={() => setProof(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
