import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import {
  WpIcon,
  DownloadIcon,
  RefreshIcon,
  BadgeIcon,
  InfinityIcon,
  GiftIcon,
  BoltIcon,
  CrownIcon,
  MegaphoneIcon,
} from "../components/Icons.jsx";

// Unified feature matrix (like the reference): every plan shows the same list,
// with a ✓ when included and a grey — when not.
const PLAN_MATRIX = [
  { label: "Access to all premium Themes & Plugins", all: true },
  { label: "Personal & Commercial gpl LICENCE", all: true },
  { label: "Use it on Multiple Websites", all: true },
  { label: "Unlimited Downloads", all: true },
  { label: "Regular Future Updates for all items", all: true },
  { label: "24x7 Dedicated Contact Support", all: true },
  {
    label: { monthly: "7 Days Money Back Guarantee", yearly: "30 Days Money Back Guarantee", lifetime: "30 Days Money Back Guarantee" },
    all: true,
  },
  { label: "FREE Gifts worth ₹40,000", only: ["lifetime"] },
  { label: "Lifetime Validity", only: ["lifetime"] },
];

function planIcon(billingType) {
  if (billingType === "lifetime") return <BoltIcon />;
  if (billingType === "monthly") return <MegaphoneIcon />;
  return <CrownIcon />;
}

const FEATURES = [
  { Icon: WpIcon, label: "Access to 5000+ WP Themes & Plugins" },
  { Icon: DownloadIcon, label: "Download anything you want" },
  { Icon: RefreshIcon, label: "Lifetime Future Updates for all items" },
  { Icon: BadgeIcon, label: "100% gpl LICENCED Themes & Plugins" },
  { Icon: InfinityIcon, label: "Use it on Multiple Websites" },
  { Icon: GiftIcon, label: "Free Gifts included worth ₹40k" },
];

const WHATYOUGET = [
  "Access to all premium themes & plugins like Elementor Pro, Astra Pro, etc.",
  "Lifetime Validity of all pro themes and plugins",
  "100% Genuine General Public Licenced themes and plugins",
  "Personal and Commercial Licence uses allowed",
  "You can use it on Multiple Websites",
  "Regular Future Updates for all themes, plugins and templates",
  "Free Gifts worth ₹40,000 included with Lifetime subscription plan",
  "Canva Pro for 1 YEAR",
  "24x7 Dedicated Contact Support",
  "30 Days Money Back Guarantee",
  "No Hidden Charges",
];

const REVIEWS = [
  {
    name: "Guddu Galodev",
    role: "Web Developer",
    text: "I needed WoodMart and XStore WP themes but couldn't afford the official prices. Then I found Blizmatt who was offering 5,000+ premium themes and plugins at an unbelievable price. Totally worth it!",
  },
  {
    name: "Anjali Verma",
    role: "Web Developer",
    text: "I found out about Blizmatt through an ad, and it's been great since the first experience. I've almost downloaded more than 50+ items and very happy with the service.",
  },
  {
    name: "Aditya Verma",
    role: "Freelancer",
    text: "I've been using the service for more than 1 month and I am very amazed at how I can find almost any theme or plugin. The website UI is also decent and the customer support is incredible.",
  },
];

const WA_CONVERSATIONS = [
  {
    name: "Guddu G.",
    msgs: [
      { sent: false, text: "Bhai kya Blizmatt ka service genuine hai? 5000+ themes sach me milte hain?" },
      { sent: true, text: "Haan bilkul! Maine 60+ themes download kiye hain, sab 100% working hain 🔥" },
      { sent: false, text: "Thanks bhai valuable feedback ke liye 😊" },
    ],
  },
  {
    name: "Anjali V.",
    msgs: [
      { sent: false, text: "I found Blizmatt through an ad. 50+ downloads ho gaye, sab perfect! Very happy 😊" },
      { sent: true, text: "Great to hear! Thanks for your kind words 🙏" },
      { sent: false, text: "Kisi bhi theme ke liye recommend karungi definitely!" },
    ],
  },
  {
    name: "Aditya V.",
    msgs: [
      { sent: false, text: "1 month se use kar raha hun. Almost koi bhi theme/plugin mil jaata hai yahan! ⭐" },
      { sent: true, text: "We're glad you're loving it! Enjoy unlimited downloads 🎉" },
      { sent: false, text: "Customer support bhi ekdum top class hai, thank you!" },
    ],
  },
  {
    name: "Rahul K.",
    msgs: [
      { sent: false, text: "Elementor Pro, Astra Pro sab 499 mein? Ye to zabardast deal hai bhai! 🤩" },
      { sent: true, text: "Haan! Plus Canva Pro bhi gift mein milta hai Lifetime plan ke saath 🎁" },
      { sent: false, text: "Liya bhai! Best investment ever 💯" },
    ],
  },
  {
    name: "Priya S.",
    msgs: [
      { sent: false, text: "Freelancer hun, ye service ne thousands of rupees bachaye mujhe!" },
      { sent: false, text: "All themes working perfectly on client sites. 5 star rating ⭐⭐⭐⭐⭐" },
    ],
  },
  {
    name: "Vikram S.",
    msgs: [
      { sent: false, text: "Lifetime validity bhi hai? No recurring charges? Ye to kamaal hai!" },
      { sent: true, text: "Ek baar 499 lo, lifetime access! Koi hidden charges nahi 😊" },
      { sent: false, text: "Done! Bahut accha service hai Blizmatt ka, recommend karunga 👍" },
    ],
  },
];

const FAQS = [
  {
    q: "How will I get access of premium Themes and Plugins?",
    a: "After your subscription is activated, you simply log in to our website and download any theme or plugin directly from your account — no extra steps needed.",
  },
  {
    q: "Will I also get the Licence for all the premium Themes and Plugins?",
    a: "Yes. Everything is 100% genuine GPL (General Public Licence), so you are free to use them for personal and commercial projects.",
  },
  {
    q: "Can I use it on multiple websites?",
    a: "Absolutely. You can use the themes and plugins on as many websites as you want, including your own and your clients' sites.",
  },
  {
    q: "How many downloads will I get per day?",
    a: "Downloads are completely unlimited. There is no daily limit during your active membership.",
  },
  {
    q: "Will I get future updates?",
    a: "Yes, you get regular future updates for all themes, plugins and templates for the entire validity of your plan.",
  },
  {
    q: "How can I contact support?",
    a: "We provide 24x7 dedicated support. You can reach us anytime via WhatsApp or the contact page and we'll help you right away.",
  },
  {
    q: "Is it safe to use?",
    a: "Yes. All files are clean, original GPL releases scanned before upload, so they are completely safe to use on your websites.",
  },
];

function HighlightText({ text }) {
  const terms = ["Lifetime Validity", "Multiple Websites", "Future Updates", "Canva Pro", "Money Back Guarantee", "GPL", "gpl", "40,000", "LICENCE"];
  let result = text;
  terms.forEach((t) => {
    result = result.replace(new RegExp(t, "g"), `<mark>${t}</mark>`);
  });
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

export default function Membership() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const { isAuthed, isMember } = useAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const plansRef = useRef(null);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    api.get("/plans").then((r) => setPlans(r.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Scroll to the reviews section when arriving via the "Reviews" nav link
  useEffect(() => {
    if (loading || hash !== "#reviews") return;
    const el = document.getElementById("reviews");
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [loading, hash]);

  const scrollToPlans = () =>
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Put the popular plan in the centre (like the reference) when there are 3 plans
  const arranged = (() => {
    if (plans.length !== 3) return plans;
    const popular = plans.find((p) => p.isPopular);
    if (!popular) return plans;
    const rest = plans.filter((p) => p._id !== popular._id).sort((a, b) => a.price - b.price);
    return [rest[0], popular, rest[1]];
  })();

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

  const popularPlan = plans.find((p) => p.isPopular) || plans[0];

  const renderPlanCard = (plan) => {
    const save = plan.originalPrice > 0 ? Math.round((1 - plan.price / plan.originalPrice) * 100) : 0;
    const per = plan.billingType === "lifetime" ? "" : `/${plan.billingType.replace("ly", "")}`;
    return (
      <div className={plan.isPopular ? "pricing-card popular" : "pricing-card"} key={plan._id}>
        {plan.isPopular && <div className="popular-head">MOST POPULAR</div>}
        <div className="plan-body">
        <div className="plan-ico">{planIcon(plan.billingType)}</div>
        <h3>{plan.name}</h3>
        <p className="plan-desc">{plan.description}</p>
        <div className="plan-pricing">
          {plan.originalPrice > 0 && <s>₹{plan.originalPrice}</s>}
          {save > 0 && <span className="save-tag">SAVE {save}%</span>}
        </div>
        <div className="plan-price">
          <span className="cur">₹</span>{plan.price}<small>{per}</small>
        </div>
        <button
          className="btn-primary full"
          disabled={creating === plan._id || isMember}
          onClick={() => startCheckout(plan)}
        >
          {creating === plan._id ? "Please wait..." : isMember ? "Active" : "SELECT PLAN"}
        </button>
        <ul className="plan-feats">
          {PLAN_MATRIX.map((f, i) => {
            const included = f.all || (f.only || []).includes(plan.billingType);
            const label = typeof f.label === "string" ? f.label : f.label[plan.billingType] || f.label.lifetime;
            return (
              <li key={i} className={included ? "inc" : "exc"}>
                <span className="pf-mark">{included ? "✓" : "—"}</span> {label}
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    );
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;

  return (
    <div className="pricing-page">
      {/* Hero */}
      <section className="pricing-hero">
        <span className="pill-badge">PRICING</span>
        <h1>Get Everything with Premium</h1>
        <p>
          Enjoy our entire library of themes and plugins, including Elementor Pro, Astra Pro,
          etc. Themes &amp; Plugins with no hidden charges.
        </p>
        <button className="btn-primary" onClick={scrollToPlans}>Explore All Plans ↓</button>
      </section>

      {/* Feature icons */}
      <section className="feature-strip">
        {FEATURES.map((f) => (
          <div className="fs-item" key={f.label}>
            <span className="fs-icon"><f.Icon /></span>
            <span className="fs-label">{f.label}</span>
          </div>
        ))}
      </section>

      {isMember && (
        <div className="page-wrap" style={{ paddingTop: 0 }}>
          <div className="info-banner success">
            ✅ You already have an active membership. <Link to="/dashboard">Go to dashboard →</Link>
          </div>
        </div>
      )}

      {/* Plans */}
      <section className="plans-section" ref={plansRef}>
        <h2 className="section-title">Get Everything in 1 subscription</h2>
        <div className="plans-grid">
          {arranged.map((plan) => renderPlanCard(plan))}
        </div>

        <div className="no-hidden">
          Note:- There will be No Hidden Charges after your subscription is activated
        </div>
        {!isAuthed && (
          <p className="already-sub">
            Already have a subscription? <Link to="/login">LOGIN HERE</Link>
          </p>
        )}
      </section>

      {/* What you get + sticky plan card */}
      <section className="page-wrap">
        <div className="get-layout">
          <div className="whatyouget">
            <h2>What you will get in this subscription of ₹499 👇</h2>
            <ul>
              {WHATYOUGET.map((w) => (
                <li key={w}><span className="wy-check">✓</span> <HighlightText text={w} /></li>
              ))}
            </ul>
          </div>
          {popularPlan && (
            <aside className="get-aside">{renderPlanCard(popularPlan)}</aside>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="page-wrap reviews-section" id="reviews">
        <div className="center-head">
          <span className="pill-badge">OUR REVIEWS</span>
          <h2>Real Reviews from our Real Subscribers</h2>
        </div>

        {/* WhatsApp conversation screenshots */}
        <div className="wa-grid">
          {WA_CONVERSATIONS.map((conv, i) => (
            <div className="wa-card" key={i}>
              <div className="wa-topbar">
                <span className="wa-topbar-av">{conv.name[0]}</span>
                <div>
                  <div className="wa-topbar-name">{conv.name}</div>
                  <div className="wa-topbar-status">online</div>
                </div>
              </div>
              <div className="wa-chat">
                {conv.msgs.map((m, j) => (
                  <div key={j} className={m.sent ? "wa-msg wa-sent" : "wa-msg wa-recv"}>
                    {m.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="wa-see-all">
          <button className="btn-outline">SEE ALL REVIEWS</button>
        </div>

        {/* Profile reviewer cards */}
        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <div className="review-card" key={r.name}>
              <div className="rc-stars">★★★★★</div>
              <p className="rc-text">{r.text}</p>
              <div className="rc-author">
                <span className="rc-avatar">{r.name[0]}</span>
                <div>
                  <strong>{r.name}</strong>
                  <small>{r.role}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="page-wrap faq-section">
        <div className="center-head">
          <span className="pill-badge">FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Having problems with our plans? Don't hesitate to contact us.</p>
          <Link to="/contact" className="btn-outline">CONTACT US</Link>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={openFaq === i ? "faq-item open" : "faq-item"} key={f.q}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="faq-toggle">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pricing-cta">
        <h2>Enjoy Unlimited Downloads of Themes &amp; Plugins</h2>
        <div className="cta-feats">
          {FEATURES.slice(0, 4).map((f) => (
            <span key={f.label}>✓ {f.label}</span>
          ))}
        </div>
        <button className="btn-primary" onClick={scrollToPlans}>GET STARTED ↑</button>
      </section>

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
