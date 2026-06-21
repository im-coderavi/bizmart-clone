import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminDownloads() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/downloads", { params: { page, limit: 25 } })
      .then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="admin-page">
      <div className="admin-page-head"><h1>Download Tracking <small>({data.total})</small></h1></div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Product</th><th>Version</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              {data.items.map((d) => (
                <tr key={d._id}>
                  <td>{d.user?.name || "—"}</td>
                  <td>{d.user?.email || "—"}</td>
                  <td>{d.product?.name || "—"}</td>
                  <td>{d.version}</td>
                  <td>{d.ip || "—"}</td>
                  <td>{new Date(d.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={6} className="muted">No downloads recorded.</td></tr>}
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
