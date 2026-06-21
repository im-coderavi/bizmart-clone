import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "▦", end: true },
  { to: "/admin/products", label: "Products", icon: "📦" },
  { to: "/admin/categories", label: "Categories", icon: "📁" },
  { to: "/admin/plans", label: "Memberships", icon: "💳" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/blogs", label: "Blog", icon: "📝" },
  { to: "/admin/downloads", label: "Downloads", icon: "⬇" },
  { to: "/admin/payments", label: "Payments", icon: "₹" },
  { to: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <aside className={open ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand">
          <Link to="/admin">⚡ Admin Panel</Link>
        </div>
        <nav onClick={() => setOpen(false)}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="ic">{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="admin-back">← View Site</Link>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-burger" onClick={() => setOpen((o) => !o)}>☰</button>
          <div className="admin-user">
            <span>{user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
