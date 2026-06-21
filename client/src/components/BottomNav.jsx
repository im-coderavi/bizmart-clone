import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "themes":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 9v12" />
        </svg>
      );
    case "plugins":
      return (
        <svg {...common}>
          <path d="M10 3v3a2 2 0 0 0 4 0V3M3 10h3a2 2 0 0 1 0 4H3M21 14h-3a2 2 0 0 1 0-4h3" />
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      );
    case "membership":
      return (
        <svg {...common}>
          <path d="M12 3c2.5 2 4 4.8 4 8 0 2-1 3.5-1.8 4.3L12 18l-2.2-2.7C9 14.5 8 13 8 11c0-3.2 1.5-6 4-8Z" />
          <circle cx="12" cy="10.5" r="1.6" />
          <path d="M9.5 18 8 21l4-1.5L16 21l-1.5-3" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const { isAuthed, isAdmin } = useAuth();
  const accountTo = isAuthed ? (isAdmin ? "/admin" : "/dashboard") : "/login";

  const tabs = [
    { to: "/", icon: "home", label: "Home", end: true },
    { to: "/products?category=wordpress-themes", icon: "themes", label: "Themes" },
    { to: "/products?category=wordpress-plugins", icon: "plugins", label: "Plugins" },
    { to: "/membership", icon: "membership", label: "Plans" },
    { to: accountTo, icon: "account", label: "Account" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {tabs.map((t) => (
        <NavLink
          key={t.label}
          to={t.to}
          end={t.end}
          className={({ isActive }) => (isActive ? "bn-item active" : "bn-item")}
        >
          <span className="bn-icon">
            <Icon name={t.icon} />
          </span>
          <span className="bn-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
