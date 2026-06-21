import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

const TYPES = ["Theme", "Plugin", "Template", "Course", "Graphic"];
const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "name", label: "Name (A-Z)" },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const type = params.get("type") || "";
  const sort = params.get("sort") || "latest";
  const page = Number(params.get("page") || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.items)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { search, category, type, sort, page, limit: 12 } })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, type, sort, page]);

  return (
    <div className="page-wrap products-page">
      <div className="page-head">
        <h1>{search ? `Results for “${search}”` : "All Products"}</h1>
        <p>{data.total} item(s)</p>
      </div>

      <div className="products-layout">
        <aside className="filters">
          <div className="filter-group">
            <h4>Category</h4>
            <button className={!category ? "f-item active" : "f-item"} onClick={() => setParam("category", "")}>
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                className={category === c.slug ? "f-item active" : "f-item"}
                onClick={() => setParam("category", c.slug)}
              >
                {c.name} <em>{c.productCount}</em>
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h4>Type</h4>
            <button className={!type ? "f-item active" : "f-item"} onClick={() => setParam("type", "")}>
              All Types
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                className={type === t ? "f-item active" : "f-item"}
                onClick={() => setParam("type", t)}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        <div className="products-main">
          <div className="products-toolbar">
            <select value={sort} onChange={(e) => setParam("sort", e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : data.items.length === 0 ? (
            <div className="page-message">No products found. Try a different filter.</div>
          ) : (
            <div className="catalog-grid">
              {data.items.map((p) => (
                <ProductCard product={p} key={p._id} />
              ))}
            </div>
          )}

          {data.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === page ? "active" : ""}
                  onClick={() => setParam("page", String(n))}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
