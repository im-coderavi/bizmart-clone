import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Mascot from "../components/Mascot.jsx";
import { ArrowIcon, CheckLine, BoltIcon } from "../components/Icons.jsx";
import Loader from "../components/Loader.jsx";

function HighlightText({ text }) {
  const highlights = ["Lifetime Validity", "Multiple Websites", "Future Updates", "Canva Pro", "Money Back Guarantee"];
  let rendered = text;
  highlights.forEach((w) => {
    rendered = rendered.replace(w, `<mark>${w}</mark>`);
  });
  return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
}

const benefits = [
  "Access to all premium themes & plugins like Elementor Pro, Astra Pro, etc...",
  "Lifetime Validity of all pro themes and plugins",
  "100% Genuine General Public LICENCED themes and plugins",
  "Personal and Commercial LICENCE uses allowed",
  "You can use it on Multiple Websites",
  "Regular Future Updates for all themes, plugins and templates",
  "Free Gifts worth ₹40,000 included with Lifetime subscription plan",
  "Canva Pro for 1 YEAR",
  "24x7 Dedicated Contact Support",
  "30 Days Money Back Guarantee",
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [p, pl] = await Promise.all([
          api.get("/products", { params: { featured: true, limit: 24, sort: "popular" } }),
          api.get("/plans"),
        ]);
        setProducts(p.data.items);
        setPlan(pl.data.items.find((x) => x.isPopular) || pl.data.items[0] || null);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            <span>Premium</span> WordPress Themes And Plugins
          </h1>
          <div className="hero-points">
            <CheckLine text="Unlimited Downloads & Lifetime Validity" />
            <CheckLine text="Regular Future Updates for all items" />
            <CheckLine text="Use everything on Multiple Websites" />
            <CheckLine text="24x7 Dedicated Contact Support" />
          </div>
          <SearchBar large />
          <div className="filter-row">
            <button className="pill" onClick={() => navigate("/products?category=wordpress-themes")}>
              Theme
            </button>
            <button className="pill" onClick={() => navigate("/products?category=wordpress-plugins")}>
              Plugin
            </button>
          </div>
        </div>
        <Mascot />
      </section>

      <section className="catalog">
        {loading ? (
          <Loader />
        ) : (
          <div className="catalog-grid">
            {products.map((p) => (
              <ProductCard product={p} key={p._id} />
            ))}
          </div>
        )}
        <Link className="outline-cta" to="/products">
          SEE ALL THEMES AND PLUGINS <ArrowIcon />
        </Link>
      </section>

      <section className="pricing">
        <h2 className="section-title">Get Everything in 1 subscription</h2>
        <div className="get-layout">
          <div className="whatyouget">
            <h2>What you will get in this subscription of ₹{plan?.price ?? 499} 👇</h2>
            <ul>
              {benefits.map((b) => (
                <li key={b}>
                  <span className="wy-check">✓</span>
                  <HighlightText text={b} />
                </li>
              ))}
            </ul>
          </div>

          {plan && (
            <aside className="get-aside">
              <div className="pricing-card popular">
                <div className="popular-head">MOST POPULAR</div>
                <div className="plan-body">
                  <div className="plan-ico"><BoltIcon /></div>
                  <h3>{plan.name}</h3>
                  <p className="plan-desc">{plan.description || "Best value for money"}</p>
                  <div className="plan-pricing">
                    {plan.originalPrice > 0 && <s>₹{plan.originalPrice}</s>}
                    {plan.originalPrice > 0 && (
                      <span className="save-tag">
                        SAVE {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="plan-price">
                    <span className="cur">₹</span>{plan.price}
                  </div>
                  <Link className="btn-primary full" to="/membership">
                    SELECT PLAN
                  </Link>
                  <ul className="plan-feats">
                    {plan.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>

        <div className="login-line">
          Already have a subscription? <Link to="/login"><button>LOGIN HERE</button></Link>
        </div>

        <div className="wide-benefit">
          <span>Get all these Benefits included in Lifetime Premium Subscription Plan</span>
          <Link to="/membership">GET STARTED »</Link>
        </div>
      </section>
    </>
  );
}
