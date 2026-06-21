import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthed, isMember, user, refreshUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState("");
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMsg("");
    api
      .get(`/products/${slug}`)
      .then((r) => {
        setProduct(r.data.product);
        setRelated(r.data.related);
        setActiveImg(r.data.product.thumbnail || r.data.product.screenshots?.[0] || "");
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (user && product) setFav(user.favorites?.some((f) => String(f) === String(product._id)));
  }, [user, product]);

  const owns = user?.purchasedProducts?.some((p) => String(p) === String(product?._id));
  const canDownload = isMember || owns;

  const handleDownload = async () => {
    if (!isAuthed) return navigate("/login", { state: { from: `/product/${slug}` } });
    // no access yet -> send to checkout (buy single product or membership)
    if (!canDownload) return navigate(`/checkout/${slug}`);

    setDownloading(true);
    setMsg("");
    try {
      const { data } = await api.get(`/member/download/${product._id}`);
      window.open(data.url, "_blank");
      setMsg(`Downloading ${data.name} v${data.version}...`);
      setProduct((p) => ({ ...p, downloadsCount: p.downloadsCount + 1 }));
    } catch (err) {
      if (err.needMembership || err.needPurchase || err.response?.status === 403) {
        navigate(`/checkout/${slug}`);
      } else {
        setMsg(err.uiMessage);
      }
    } finally {
      setDownloading(false);
    }
  };

  const toggleFav = async () => {
    if (!isAuthed) return navigate("/login");
    try {
      await api.post(`/member/favorites/${product._id}`);
      setFav((f) => !f);
      refreshUser();
    } catch {
      /* ignore */
    }
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;
  if (!product)
    return (
      <div className="page-wrap">
        <div className="page-message">Product not found. <Link to="/products">Browse all</Link></div>
      </div>
    );

  const gallery = [product.thumbnail, ...(product.screenshots || [])].filter(Boolean);

  return (
    <div className="page-wrap detail-page">
      <div className="detail-top">
        <div className="detail-gallery">
          <div className="main-img">
            <img src={activeImg} alt={product.name} />
          </div>
          {gallery.length > 1 && (
            <div className="thumbs">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  className={activeImg === g ? "active" : ""}
                  onClick={() => setActiveImg(g)}
                >
                  <img src={g} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <div className="detail-badges">
            <span className="tag">{product.category?.name}</span>
            <span className="tag">{product.type}</span>
            {product.membershipRequired && <span className="tag member">Membership</span>}
          </div>
          <h1>{product.name}</h1>
          <div className="detail-meta">
            <span>★ {product.ratingAvg?.toFixed(1) || "0.0"} ({product.ratingCount} reviews)</span>
            <span>{product.downloadsCount?.toLocaleString()} downloads</span>
            <span>v{product.version}</span>
          </div>
          <p className="detail-short">{product.shortDescription}</p>

          <ul className="quick-facts">
            <li><b>Version</b> {product.version}</li>
            <li><b>Last Updated</b> {new Date(product.updatedAt).toLocaleDateString()}</li>
            <li><b>File Size</b> {product.fileSize || "—"}</li>
            <li><b>License</b> GPL</li>
          </ul>

          <div className="detail-actions">
            <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
              {downloading
                ? "Preparing..."
                : canDownload
                ? "⬇ Download"
                : product.price > 0
                ? `⬇ Get this product — ₹${product.price}`
                : "⬇ Download"}
            </button>
            {product.demoUrl && (
              <a className="btn-outline" href={product.demoUrl} target="_blank" rel="noreferrer">
                Live Demo
              </a>
            )}
            <button className="btn-icon" onClick={toggleFav} title="Save">
              {fav ? "♥" : "♡"}
            </button>
          </div>

          {owns ? (
            <div className="member-hint ok">
              ✓ You own this product — download anytime.
            </div>
          ) : isMember ? (
            <div className="member-hint ok">
              ✓ Your membership is active — download this and any product, unlimited.
            </div>
          ) : (
            <Link className="member-hint" to={`/checkout/${slug}`}>
              🔒 {product.price > 0 ? `Buy this product for ₹${product.price}` : "Membership required"} — or get a membership for unlimited downloads →
            </Link>
          )}
          {msg && <div className="detail-msg">{msg}</div>}
        </div>
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

      {related.length > 0 && (
        <div className="related">
          <h2>Related Products</h2>
          <div className="catalog-grid">
            {related.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
