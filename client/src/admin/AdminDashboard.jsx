import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

const cards = [
  { key: "totalUsers", label: "Total Users", icon: "👥" },
  { key: "activeMembers", label: "Active Members", icon: "⭐" },
  { key: "totalProducts", label: "Total Products", icon: "📦" },
  { key: "downloadsToday", label: "Downloads Today", icon: "⬇" },
  { key: "totalDownloads", label: "Total Downloads", icon: "📊" },
  { key: "membershipSales", label: "Membership Sales", icon: "🧾" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <div className="page-message">Could not load stats.</div>;

  return (
    <div className="admin-dash">
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-card revenue">
          <span className="ic">₹</span>
          <div>
            <span className="num">₹{stats.revenue.toLocaleString()}</span>
            <span className="lbl">Total Revenue</span>
          </div>
        </div>
        {cards.map((c) => (
          <div className="stat-card" key={c.key}>
            <span className="ic">{c.icon}</span>
            <div>
              <span className="num">{stats[c.key]?.toLocaleString()}</span>
              <span className="lbl">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-cols">
        <div className="admin-box">
          <h3>Recent Payments</h3>
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Plan</th><th>Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
              {stats.recentPayments.map((p) => (
                <tr key={p._id}>
                  <td>{p.user?.name || "—"}</td>
                  <td>{p.plan?.name || "—"}</td>
                  <td>₹{p.amount}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentPayments.length === 0 && (
                <tr><td colSpan={4} className="muted">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-box">
          <h3>Top Products</h3>
          <ul className="top-list">
            {stats.topProducts.map((t, i) => (
              <li key={i}>
                <span>{i + 1}. {t.name}</span>
                <em>{t.count} ⬇</em>
              </li>
            ))}
            {stats.topProducts.length === 0 && <li className="muted">No downloads yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
