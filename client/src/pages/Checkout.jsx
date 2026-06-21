import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthed, isMember } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login", { state: { from: `/checkout/${slug}` } });
      return;
    }
    api.get(`/products/${slug}`)
      .then((r) => setProduct(r.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, isAuthed]);

  const startProductOrder = async () => {
    setStarting(true);
    setError("");
    try {
      const { data } = await api.post("/payments/create-order", { productId: product._id });
      setOrder(data);
    } catch (err) {
      setError(err.uiMessage || "Could not start checkout");
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;
  if (!product)
    return <div className="page-wrap"><div className="page-message">Product not found.</div></div>;

  const canBuySingle = product.price > 0;

  return (
    <div className="page-wrap checkout-page-full">
      <div className="page-head">
        <h1>Checkout</h1>
        <p>Buy this product, or get a membership for unlimited downloads.</p>
      </div>

      {isMember && (
        <div className="info-banner success">
          ✅ You already have an active membership — you can download this for free.{" "}
          <Link to={`/product/${slug}`}>Go to product →</Link>
        </div>
      )}

      <div className="checkout-grid">
        {/* product summary */}
        <div className="checkout-product">
          <img src={product.thumbnail} alt={product.name} />
          <div>
            <h3>{product.name}</h3>
            <p className="muted">{product.category?.name} · v{product.version}</p>
            {canBuySingle ? (
              <div className="co-price">₹{product.price}</div>
            ) : (
              <div className="muted">Available with membership only</div>
            )}
          </div>
        </div>

        {/* payment area */}
        <div className="checkout-pay">
          {!order ? (
            <>
              <div className="co-options">
                {canBuySingle && (
                  <button className="btn-primary full" disabled={starting} onClick={startProductOrder}>
                    {starting ? "Please wait..." : `Buy this product — ₹${product.price}`}
                  </button>
                )}
                <Link className="btn-outline full" to="/membership">
                  Get Membership (unlimited downloads) →
                </Link>
              </div>
              {error && <div className="auth-error" style={{ marginTop: 14 }}>{error}</div>}
              {!canBuySingle && (
                <p className="muted" style={{ marginTop: 12 }}>
                  This product isn't sold individually. Get a membership to download it.
                </p>
              )}
            </>
          ) : (
            <PayBlock order={order} onClose={() => setOrder(null)} />
          )}
        </div>
      </div>
    </div>
  );
}

function PayBlock({ order }) {
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const p = order.payment || {};

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!utr.trim()) return setError("Please enter the UTR / Transaction ID");
    if (!file) return setError("Please upload the payment screenshot");
    setSubmitting(true);
    const fd = new FormData();
    fd.append("utr", utr);
    fd.append("screenshot", file);
    try {
      await api.post(`/payments/${order.paymentId}/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
    } catch (err) {
      setError(err.uiMessage || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="checkout-done">
        <div className="big-tick">✅</div>
        <h2>Payment Submitted!</h2>
        <p>
          Your payment for <b>{order.product?.name}</b> is under review. Once the admin verifies
          it, the <b>download link will be emailed to you</b> and added to your dashboard.
        </p>
        <button className="btn-primary full" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <h3>Pay ₹{order.amount} for {order.product?.name}</h3>
      {!p.upiId && !p.qrImage ? (
        <div className="auth-error">Payment details not configured. Please contact support.</div>
      ) : (
        <div className="pay-details">
          {p.qrImage && (
            <div className="qr-block">
              <img src={p.qrImage} alt="Scan to pay" />
              <span>Scan & Pay ₹{order.amount}</span>
            </div>
          )}
          <div className="upi-block">
            {p.payeeName && <p><b>Pay to:</b> {p.payeeName}</p>}
            {p.upiId && (
              <p className="upi-id">
                <b>UPI ID:</b> <code>{p.upiId}</code>
                <button type="button" onClick={() => navigator.clipboard?.writeText(p.upiId)}>Copy</button>
              </p>
            )}
            {p.instructions && <p className="upi-note">{p.instructions}</p>}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="utr-form">
        {error && <div className="auth-error">{error}</div>}
        <label>
          UTR / Transaction ID *
          <input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 4012XXXXXXXX" />
        </label>
        <label>
          Payment Screenshot *
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        {file && <img className="preview" src={URL.createObjectURL(file)} alt="" />}
        <button className="btn-primary full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Payment"}
        </button>
      </form>
    </>
  );
}
