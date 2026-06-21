import { Link } from "react-router-dom";

const logo =
  "https://app.blizmatt.com/wp-content/uploads/2025/03/Blizmatt-Digital-300x78.png.webp";

function Col({ title, items }) {
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      {items.map((it) => (
        <Link to={it.to} key={it.label}>
          {it.label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-about">
          <img src={logo} alt="Digital Marketplace" />
          <p>
            Get access to a vast collection of 5,000+ premium WordPress themes and plugins.
            Build stunning, mobile-friendly websites effortlessly with top-quality GPL resources.
          </p>
          <div className="stats">
            <div>
              <strong>25,000+</strong>
              <span>themes downloaded</span>
            </div>
            <div>
              <strong>18,000+</strong>
              <span>plugins downloaded</span>
            </div>
          </div>
        </div>

        <Col
          title="QUICK LINKS"
          items={[
            { label: "Home", to: "/" },
            { label: "WP Themes", to: "/products?category=wordpress-themes" },
            { label: "WP Plugins", to: "/products?category=wordpress-plugins" },
            { label: "Blog", to: "/blog" },
            { label: "Membership", to: "/membership" },
            { label: "Contact Us", to: "/contact" },
          ]}
        />
        <Col
          title="TOP THEMES"
          items={[
            { label: "Astra Pro", to: "/products?search=astra" },
            { label: "Woodmart", to: "/products?search=woodmart" },
            { label: "XStore Premium", to: "/products?search=xstore" },
            { label: "GeneratePress", to: "/products?search=generatepress" },
            { label: "Newspaper", to: "/products?search=newspaper" },
            { label: "Foxiz", to: "/products?search=foxiz" },
          ]}
        />
        <Col
          title="TOP PLUGINS"
          items={[
            { label: "Elementor Pro", to: "/products?search=elementor" },
            { label: "Rank Math Pro", to: "/products?search=rank+math" },
            { label: "Unlimited Elements", to: "/products?search=unlimited" },
            { label: "Yoast SEO Premium", to: "/products?search=yoast" },
            { label: "ElementsKit Pro", to: "/products?search=elementskit" },
            { label: "WP Rocket", to: "/products?search=wp+rocket" },
          ]}
        />

        <div className="footer-col">
          <h4>CONTACT US</h4>
          <a href="tel:+919234220213">+91 92342 20213</a>
          <a href="tel:+919973596593">+91 99735 96593</a>
          <a href="mailto:admin@blizmatt.com">admin@blizmatt.com</a>
          <a href="mailto:info@blizmatt.com">info@blizmatt.com</a>
          <p>
            N Road Bistupur,
            <br />
            Jamshedpur, Jharkhand - 831001
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="policies">
          {["Privacy Policy", "Terms of Use", "Disclaimer", "Refund Policy", "Shipping Policy", "Documentation"].map(
            (item) => (
              <Link to="/contact" key={item}>
                {item}
              </Link>
            )
          )}
          <span>Copyright 2025 All rights reserved</span>
        </div>
        <p>
          If you are the owner or an authorized representative and wish to request the removal of
          any product, please contact us at{" "}
          <a href="mailto:admin@blizmatt.com">admin@blizmatt.com</a>
        </p>
        <div className="socials">
          <span>f</span>
          <span>◎</span>
          <span>▶</span>
        </div>
      </div>
    </footer>
  );
}
