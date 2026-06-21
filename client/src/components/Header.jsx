import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SearchBar from "./SearchBar.jsx";

const logo =
  "https://app.blizmatt.com/wp-content/uploads/2025/03/Blizmatt-Digital-300x78.png.webp";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Themes", to: "/products?category=wordpress-themes" },
  { label: "Plugins", to: "/products?category=wordpress-plugins" },
  { label: "Blog", to: "/blog" },
  { label: "Contact Us", to: "/contact" },
  { label: "Plans and Pricing", to: "/membership" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthed, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 190);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "header compact" : "header"}>
      <Link className="brand" to="/" aria-label="Home">
        <img src={logo} alt="Digital Marketplace" />
      </Link>

      <div className="header-search">
        <SearchBar />
      </div>

      <nav className={menuOpen ? "nav-open" : ""} onClick={() => setMenuOpen(false)}>
        {NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => (isActive ? "active" : "")}
            end={item.to === "/"}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {isAuthed ? (
        <>
          <Link className="gift-button" to={isAdmin ? "/admin" : "/dashboard"}>
            {isAdmin ? "ADMIN" : "DASHBOARD"}
          </Link>
          <button
            className="login-button"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            LOGOUT
          </button>
        </>
      ) : (
        <>
          <Link className="gift-button" to="/membership">
            FREE GIFTS
          </Link>
          <Link className="login-button" to="/login">
            LOGIN
          </Link>
        </>
      )}

      <button
        className="mobile-menu"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
