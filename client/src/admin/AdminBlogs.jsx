import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminBlogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/blogs").then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (b) => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    await api.delete(`/admin/blogs/${b._id}`);
    load();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Blog Posts</h1>
        <Link className="btn-primary" to="/admin/blogs/new">+ New Post</Link>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((b) => (
                <tr key={b._id}>
                  <td>{b.title}</td>
                  <td>{b.category}</td>
                  <td><span className={`pill-status ${b.status}`}>{b.status}</span></td>
                  <td>{b.views}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <Link to={`/admin/blogs/${b._id}`}>Edit</Link>
                    <button onClick={() => remove(b)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="muted">No posts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
