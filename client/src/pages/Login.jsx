import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.uiMessage || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="auth-sub">Login to access your downloads.</p>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <div className="auth-row">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="btn-primary full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-demo">
          Demo member: <b>member@demo.com</b> / <b>demo123</b><br />
          Admin: <b>admin@blizmatt.com</b> / <b>admin123</b>
        </p>
      </form>
    </div>
  );
}
