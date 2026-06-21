import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMsg(data.message);
    } catch (err) {
      setMsg(err.uiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Reset password</h1>
        <p className="auth-sub">Enter your email and we'll send a reset link.</p>
        {msg && <div className="auth-info">{msg}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn-primary full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
