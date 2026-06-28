import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="pc-thumb">
        <img src={product.thumbnail} alt={product.name} loading="lazy" />
        {product.type && <span className="pc-badge">{product.type}</span>}
      </Link>
      <h3>
        <Link to={`/product/${product.slug}`}>{product.name}</Link>
      </h3>
      <div className="pc-meta">
        {product.ratingAvg > 0 && <span>★ {product.ratingAvg.toFixed(1)}</span>}
        {product.downloadsCount > 0 && (
          <span>{product.downloadsCount.toLocaleString()} downloads</span>
        )}
      </div>
      <div className="pc-foot">
        <Link className="pc-link" to={`/product/${product.slug}`}>
          Download Now »
        </Link>
      </div>
    </article>
  );
}
