import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Membership() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [checkout, setCheckout] = useState(null); // order data when paying
  const { isAuthed, isMember } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/plans").then((r) => setPlans(r.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const startCheckout = async (plan) => {
    if (!isAuthed) return navigate("/login", { state: { from: "/membership" } });
    setCreating(plan._id);
    try {
      const { data } = await api.post("/payments/create-order", { planId: plan._id });
      setCheckout(data);
    } catch (err) {
      alert(err.uiMessage || "Could not start checkout");
    } finally {
      setCreating(null);
    }
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;

  return (
    <div className="page-wrap membership-page">
      <div className="page-head center">
        <h1>Choose Your Membership</h1>
        <p>Unlimited access to 5,000+ premium themes, plugins & templates.</p>
      </div>

      {isMember && (
        <div className="info-banner success">
          ✅ You already have an active membership. <a href="/dashboard">Go to dashboard →</a>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => {
          const save = plan.originalPrice > 0 ? Math.round((1 - plan.price / plan.originalPrice) * 100) : 0;
          return (
            <div className={plan.isPopular ? "plan-box popular" : "plan-box"} key={plan._id}>
              {plan.isPopular && <div className="ribbon">MOST POPULAR</div>}
              <h3>{plan.name}</h3>
              <p className="plan-desc">{plan.description}</p>
              <div className="plan-price">
                <span className="cur">₹</span>
                {plan.price}
                {plan.billingType !== "lifetime" && <small>/{plan.billingType.replace("ly", "")}</small>}
              </div>
              {save > 0 && (
                <div className="plan-save">
                  <s>₹{plan.originalPrice}</s> SAVE {save}%
                </div>
              )}
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                className="btn-primary full"
                disabled={creating === plan._id || isMember}
                onClick={() => startCheckout(plan)}
              >
                {creating === plan._id ? "Please wait..." : isMember ? "Active" : `Get ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="checkout-note">🔒 Secure manual UPI/QR checkout · 30-day money-back guarantee.</p>

      {checkout && <CheckoutModal order={checkout} onClose={() => setCheckout(null)} />}
    </div>
  );
}

function CheckoutModal({ order, onClose }) {
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const p = order.payment || {};

  const copyUpi = () => {
    if (p.upiId) navigator.clipboard?.writeText(p.upiId);
  };

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
      await refreshUser();
      setDone(true);
    } catch (err) {
      setError(err.uiMessage || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="checkout-done">
            <div className="big-tick">✅</div>
            <h2>Payment Submitted!</h2>
            <p>
              Your payment for <b>{order.plan?.name}</b> is under review. We'll verify it and
              activate your membership shortly — you'll get a confirmation email.
            </p>
            <button className="btn-primary full" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <h2>Pay ₹{order.amount} — {order.plan?.name}</h2>

            {!p.upiId && !p.qrImage ? (
              <div className="auth-error">
                Payment details are not configured yet. Please contact support.
              </div>
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
                      <button type="button" onClick={copyUpi}>Copy</button>
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
              <div className="form-actions">
                <button className="btn-primary" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
