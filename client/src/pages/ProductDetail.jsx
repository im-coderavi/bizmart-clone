import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

const PERKS = [
  "Access to 5000+ Premium WordPress Themes and Plugins",
  "Download anything you want",
  "Lifetime Validity & Future Updates",
  "Use it on Multiple Websites",
  "30 Days Money Back Guarantee",
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthed, isMember } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState("");

  // Explore section (paginated, 12 per page)
  const [explore, setExplore] = useState([]);
  const [exPage, setExPage] = useState(1);
  const [exPages, setExPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setMsg("");
    window.scrollTo(0, 0);
    api
      .get(`/products/${slug}`)
      .then((r) => setProduct(r.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setExPage(1);
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api
      .get("/products", { params: { limit: 12, page: exPage } })
      .then((r) => {
        setExplore((r.data.items || []).filter((p) => p._id !== product._id));
        setExPages(r.data.pages || 1);
      })
      .catch(() => {});
  }, [product, exPage]);

  // Download is members-only. No single-product purchase.
  const canDownload = isMember;

  const handleDownload = async () => {
    if (!isAuthed) return navigate("/login", { state: { from: `/product/${slug}` } });
    if (!canDownload) return navigate("/membership");

    setDownloading(true);
    setMsg("");
    try {
      const { data } = await api.get(`/member/download/${product._id}`);
      window.open(data.url, "_blank");
      setMsg(`Downloading ${data.name} v${data.version}...`);
      setProduct((p) => ({ ...p, downloadsCount: p.downloadsCount + 1 }));
    } catch (err) {
      if (err.needMembership || err.needPurchase || err.response?.status === 403) {
        navigate("/membership");
      } else {
        setMsg(err.uiMessage);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;
  if (!product)
    return (
      <div className="page-wrap">
        <div className="page-message">Product not found. <Link to="/products">Browse all</Link></div>
      </div>
    );

  const heroImg = product.thumbnail || product.screenshots?.[0] || "";

  return (
    <div className="page-wrap detail-page">
      <nav className="crumb">
        <Link to="/">⌂ Home</Link>
        <span>»</span>
        <Link to={`/products?type=${encodeURIComponent(product.type || "")}`}>{product.type || "Products"}</Link>
        <span>»</span>
        <span className="crumb-current">{product.name}</span>
      </nav>

      <div className="detail-top">
        <div className="detail-left">
          <div className="title-card">
            <h1>{product.name}</h1>
          </div>

          <div className="hero-img">
            <img src={heroImg} alt={product.name} />
          </div>
        </div>

        <aside className="buy-card">
          <h2 className="buy-title">Unlimited downloads for Lifetime at just ₹499</h2>
          <ul className="buy-perks">
            {PERKS.map((p) => (
              <li key={p}><span className="bp-check">✓</span> {p}</li>
            ))}
          </ul>

          <button className="subscribe-btn shine" onClick={handleDownload} disabled={downloading}>
            <span className="sb-label">
              {downloading
                ? "Preparing..."
                : canDownload
                ? "⬇ Download Now"
                : "⬇ Subscribe to download"}
            </span>
          </button>

          {canDownload ? (
            <div className="buy-note ok">✓ Your membership is active — download this & any product, unlimited.</div>
          ) : (
            <div className="buy-note">🔒 Membership required to download. Get lifetime access at ₹499.</div>
          )}
          {msg && <div className="detail-msg">{msg}</div>}

          <div className="buy-meta">
            <span>★ {product.ratingAvg?.toFixed(1) || "0.0"}</span>
            <span>{product.downloadsCount?.toLocaleString()} downloads</span>
            <span>v{product.version}</span>
          </div>
        </aside>
      </div>

      <div className="detail-body">
        <section>
          <h2>Description</h2>
          <div className="rich" dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>

        {product.features?.length > 0 && (
          <section>
            <h2>Features</h2>
            <ul className="feature-list">
              {product.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </section>
        )}

        {product.changelog?.length > 0 && (
          <section>
            <h2>Changelog</h2>
            <ul className="changelog">
              {product.changelog.map((c, i) => (
                <li key={i}>
                  <b>v{c.version}</b>
                  {c.date && <em>{new Date(c.date).toLocaleDateString()}</em>}
                  <span>{c.notes}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {explore.length > 0 && (
        <div className="related explore-block">
          <div className="explore-head">
            <h2>Explore Some Popular {product.type ? `${product.type}s` : "Products"}</h2>
          </div>
          <div className="catalog-grid">
            {explore.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </div>
          {exPages > 1 && (
            <div className="pagination explore-pagination">
              <button disabled={exPage === 1} onClick={() => { setExPage((n) => n - 1); window.scrollTo({ top: document.querySelector(".explore-block")?.offsetTop - 80, behavior: "smooth" }); }}>‹ Prev</button>
              {Array.from({ length: exPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === exPage ? "active" : ""} onClick={() => { setExPage(n); window.scrollTo({ top: document.querySelector(".explore-block")?.offsetTop - 80, behavior: "smooth" }); }}>{n}</button>
              ))}
              <button disabled={exPage === exPages} onClick={() => { setExPage((n) => n + 1); window.scrollTo({ top: document.querySelector(".explore-block")?.offsetTop - 80, behavior: "smooth" }); }}>Next ›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
