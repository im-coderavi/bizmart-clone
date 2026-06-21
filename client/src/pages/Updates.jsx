import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

function dayLabel(d) {
  const date = new Date(d);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === y.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export default function Updates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/updates", { params: { limit: 50 } })
      .then((r) => setItems(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // group by day
  const groups = [];
  let current = null;
  items.forEach((it) => {
    const label = dayLabel(it.updatedAt);
    if (!current || current.label !== label) {
      current = { label, rows: [] };
      groups.push(current);
    }
    current.rows.push(it);
  });

  return (
    <div className="page-wrap updates-page">
      <div className="page-head center">
        <h1>Latest Updates</h1>
        <p>New products and version updates — freshly added to the library.</p>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="page-message">No updates yet.</div>
      ) : (
        <div className="updates-timeline">
          {groups.map((g) => (
            <section className="upd-group" key={g.label}>
              <h2 className="upd-day">{g.label}</h2>
              <div className="upd-list">
                {g.rows.map((it) => (
                  <Link to={`/product/${it.slug}`} className="upd-item" key={it._id + it.updatedAt}>
                    <span className={`upd-dot ${it.kind}`} />
                    {it.thumbnail && <img src={it.thumbnail} alt="" loading="lazy" />}
                    <div className="upd-body">
                      <div className="upd-top">
                        <span className={`upd-tag ${it.kind}`}>
                          {it.kind === "new" ? "NEW" : "UPDATED"}
                        </span>
                        <h3>{it.name}</h3>
                      </div>
                      <div className="upd-meta">
                        <span>{it.category?.name}</span>
                        <span>v{it.version}</span>
                        <span>{new Date(it.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {it.note && <p className="upd-note">“{it.note}”</p>}
                    </div>
                    <span className="upd-go">Download →</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
