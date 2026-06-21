import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function Blog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blogs").then((r) => setItems(r.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap blog-page">
      <div className="page-head center">
        <h1>Latest from the Blog</h1>
        <p>Guides, tutorials and news about themes & plugins.</p>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="page-message">No posts yet.</div>
      ) : (
        <div className="blog-grid">
          {items.map((b) => (
            <Link to={`/blog/${b.slug}`} className="blog-card" key={b._id}>
              <div className="blog-thumb">
                {b.coverImage && <img src={b.coverImage} alt={b.title} loading="lazy" />}
                <span className="blog-cat">{b.category}</span>
              </div>
              <div className="blog-body">
                <h3>{b.title}</h3>
                <p>{b.excerpt}</p>
                <div className="blog-meta">
                  <span>{b.author?.name || "Admin"}</span>
                  <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
