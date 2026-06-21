import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminProducts() {
  const [data, setData] = useState({ items: [], pages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/products", { params: { search, page, limit: 15 } })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const remove = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Products <small>({data.total})</small></h1>
        <Link className="btn-primary" to="/admin/products/new">+ Add Product</Link>
      </div>

      <input
        className="admin-search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th></th><th>Name</th><th>Category</th><th>Type</th><th>Version</th>
                <th>Downloads</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td>{p.thumbnail && <img className="row-thumb" src={p.thumbnail} alt="" />}</td>
                  <td>{p.name}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{p.type}</td>
                  <td>{p.version}</td>
                  <td>{p.downloadsCount}</td>
                  <td><span className={`pill-status ${p.status}`}>{p.status}</span></td>
                  <td className="row-actions">
                    <Link to={`/admin/products/${p._id}`}>Edit</Link>
                    <button onClick={() => remove(p._id, p.name)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr><td colSpan={8} className="muted">No products found.</td></tr>
              )}
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
