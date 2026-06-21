import { useEffect, useState } from "react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

export default function AdminSettings() {
  const [payment, setPayment] = useState({
    upiId: "", payeeName: "", qrImage: "", instructions: "", enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/admin/settings").then((r) => {
      setPayment({ ...payment, ...r.data.settings.payment });
      setLoading(false);
    });
  }, []);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setPayment((p) => ({ ...p, [k]: v }));
  };

  const uploadQr = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("files", e.target.files[0]);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setPayment((p) => ({ ...p, qrImage: data.url }));
    } catch (err) {
      setMsg(err.uiMessage);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.put("/admin/settings", { payment });
      setMsg("Settings saved!");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setMsg(err.uiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      <div className="admin-page-head"><h1>Payment Settings</h1></div>
      {msg && <div className="info-banner success">{msg}</div>}

      <form className="admin-form" onSubmit={save} style={{ maxWidth: 640 }}>
        <p className="muted" style={{ marginTop: 0 }}>
          Set your UPI ID and/or upload a payment QR code. Customers will pay here, then submit
          their UTR + screenshot for you to verify.
        </p>

        <label>
          UPI ID
          <input value={payment.upiId} onChange={set("upiId")} placeholder="yourname@okhdfcbank" />
        </label>

        <label>
          Payee Name (shown in UPI app)
          <input value={payment.payeeName} onChange={set("payeeName")} placeholder="Your Business Name" />
        </label>

        <label>
          Payment QR Code
          <div className="upload-row">
            <input value={payment.qrImage} onChange={set("qrImage")} placeholder="QR image URL or upload" />
            <label className="upload-btn">
              {uploading ? "..." : "Upload QR"}
              <input type="file" accept="image/*" hidden onChange={uploadQr} />
            </label>
          </div>
          {payment.qrImage && <img className="preview" src={payment.qrImage} alt="QR" style={{ maxWidth: 220 }} />}
        </label>

        <label>
          Instructions for customers
          <textarea rows={4} value={payment.instructions} onChange={set("instructions")} />
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={payment.enabled} onChange={set("enabled")} />
          Enable manual UPI/QR payments
        </label>

        <div className="form-actions">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
        </div>
      </form>
    </div>
  );
}
