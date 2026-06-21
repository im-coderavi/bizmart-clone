import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "", password: "" });
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    api.get("/member/dashboard").then((r) => {
      setData(r.data);
      setProfile({ name: r.data.profile.name, password: "" });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "downloads") api.get("/member/downloads").then((r) => setDownloads(r.data.items));
    if (tab === "favorites") api.get("/member/favorites").then((r) => setFavorites(r.data.items));
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault();
    const payload = { name: profile.name };
    if (profile.password) payload.password = profile.password;
    await api.put("/auth/profile", payload);
    await refreshUser();
    setSavedMsg("Profile updated!");
    setProfile((p) => ({ ...p, password: "" }));
    setTimeout(() => setSavedMsg(""), 2500);
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;

  const m = data?.membership;

  return (
    <div className="page-wrap dashboard">
      <div className="page-head">
        <h1>Hi, {user?.name} 👋</h1>
        <p>Manage your account, downloads and membership.</p>
      </div>

      {m?.isActive ? (
        <div className="member-banner active">
          <span className="mb-badge">✓ ACTIVE MEMBER</span>
          <span className="mb-text">
            You can download <b>any product</b>, unlimited — themes, plugins & templates.
            {m.isLifetime
              ? " Lifetime access 🎉"
              : m.daysRemaining != null
              ? ` ${m.daysRemaining} day(s) left.`
              : ""}
          </span>
          <Link to="/products" className="mb-cta">Browse products →</Link>
        </div>
      ) : (
        <div className="member-banner inactive">
          <span className="mb-text">🔒 You don't have an active membership — downloads are locked.</span>
          <Link to="/membership" className="mb-cta">Get Membership ₹499 →</Link>
        </div>
      )}

      <div className="dash-cards">
        <div className="dash-card">
          <span className="dc-num">{data?.stats.downloads ?? 0}</span>
          <span className="dc-label">Downloads</span>
        </div>
        <div className="dash-card">
          <span className="dc-num">{data?.stats.favorites ?? 0}</span>
          <span className="dc-label">Favorites</span>
        </div>
        <div className="dash-card">
          <span className="dc-num">{m?.isActive ? "Active" : "None"}</span>
          <span className="dc-label">Membership</span>
        </div>
      </div>

      <div className="dash-tabs">
        {["overview", "downloads", "favorites", "membership", "profile"].map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="dash-panel">
        {tab === "overview" && (
          <div>
            <h3>Recent Downloads</h3>
            {data?.recentDownloads?.length ? (
              <table className="data-table">
                <thead>
                  <tr><th>Product</th><th>Version</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {data.recentDownloads.map((d) => (
                    <tr key={d._id}>
                      <td>{d.product?.name || "—"}</td>
                      <td>{d.version}</td>
                      <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">No downloads yet. <Link to="/products">Browse products →</Link></p>
            )}
          </div>
        )}

        {tab === "downloads" && (
          <div>
            <h3>Download History</h3>
            {downloads.length ? (
              <table className="data-table">
                <thead>
                  <tr><th>Product</th><th>Version</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {downloads.map((d) => (
                    <tr key={d._id}>
                      <td>{d.product ? <Link to={`/product/${d.product.slug}`}>{d.product.name}</Link> : "—"}</td>
                      <td>{d.version}</td>
                      <td>{new Date(d.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">No downloads yet.</p>
            )}
          </div>
        )}

        {tab === "favorites" && (
          <div>
            <h3>Saved Products</h3>
            {favorites.length ? (
              <div className="catalog-grid">
                {favorites.map((p) => (
                  <article className="product-card" key={p._id}>
                    <Link to={`/product/${p.slug}`} className="pc-thumb">
                      <img src={p.thumbnail} alt={p.name} />
                    </Link>
                    <h3><Link to={`/product/${p.slug}`}>{p.name}</Link></h3>
                    <Link className="pc-link" to={`/product/${p.slug}`}>View →</Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">No favorites yet.</p>
            )}
          </div>
        )}

        {tab === "membership" && (
          <div>
            <h3>Your Membership</h3>
            {m?.isActive ? (
              <div className="membership-status">
                <p><b>Plan:</b> {m.plan?.name || "Premium"}</p>
                <p><b>Status:</b> <span className="badge-green">Active</span></p>
                <p>
                  <b>Validity:</b>{" "}
                  {m.isLifetime
                    ? "Lifetime — never expires"
                    : m.expiresAt
                    ? `${new Date(m.expiresAt).toLocaleDateString()} (${m.daysRemaining} day(s) left)`
                    : "—"}
                </p>
                <p><b>Total downloads:</b> {data?.stats.downloads ?? 0}</p>
                <p className="perk">✓ Unlimited downloads on all {0 || ""}themes, plugins & templates</p>
                {!m.isLifetime && m.expiresAt && (
                  <Link className="btn-primary" to="/membership">Renew / Extend</Link>
                )}
              </div>
            ) : (
              <div>
                <p className="muted">You don't have an active membership.</p>
                <Link className="btn-primary" to="/membership">Get Membership →</Link>
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <form className="profile-form" onSubmit={saveProfile}>
            <h3>Profile Settings</h3>
            {savedMsg && <div className="info-banner success">{savedMsg}</div>}
            <label>
              Name
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </label>
            <label>
              Email
              <input value={data?.profile.email} disabled />
            </label>
            <label>
              New Password (leave blank to keep current)
              <input
                type="password"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              />
            </label>
            <button className="btn-primary">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
}
