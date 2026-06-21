import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

const TYPES = ["Theme", "Plugin", "Template", "Course", "Graphic", "Other"];
const empty = {
  name: "", category: "", type: "Plugin", thumbnail: "", screenshots: [],
  shortDescription: "", description: "", features: [], version: "1.0.0",
  fileSize: "", downloadUrl: "", demoUrl: "", price: 0,
  membershipRequired: true, isFeatured: false, status: "published",
  metaTitle: "", metaDescription: "",
};

export default function AdminProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.items));
  }, []);

  useEffect(() => {
    if (!editing) return;
    api.get("/admin/products", { params: { limit: 1000 } }).then((r) => {
      const p = r.data.items.find((x) => x._id === id);
      if (p) setForm({ ...empty, ...p, category: p.category?._id || p.category });
      setLoading(false);
    });
  }, [id]);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const uploadImage = async (e, field) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    try {
      const { data } = await api.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (field === "thumbnail") setForm((f) => ({ ...f, thumbnail: data.url }));
      else setForm((f) => ({ ...f, screenshots: [...f.screenshots, ...data.urls] }));
    } catch (err) {
      setError(err.uiMessage);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      features: Array.isArray(form.features)
        ? form.features
        : String(form.features).split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.put(`/admin/products/${id}`, payload);
      else await api.post("/admin/products", payload);
      navigate("/admin/products");
    } catch (err) {
      setError(err.uiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const featuresText = Array.isArray(form.features) ? form.features.join("\n") : form.features;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>{editing ? "Edit Product" : "Add Product"}</h1>
      </div>
      {error && <div className="auth-error">{error}</div>}

      <form className="admin-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="full">
            Product Name *
            <input value={form.name} onChange={set("name")} required />
          </label>

          <label>
            Category *
            <select value={form.category} onChange={set("category")} required>
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select value={form.type} onChange={set("type")}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label>
            Version
            <input value={form.version} onChange={set("version")} />
          </label>

          <label>
            File Size
            <input value={form.fileSize} onChange={set("fileSize")} placeholder="e.g. 12 MB" />
          </label>

          <label className="full">
            Thumbnail
            <div className="upload-row">
              <input value={form.thumbnail} onChange={set("thumbnail")} placeholder="Image URL or upload" />
              <label className="upload-btn">
                {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" hidden onChange={(e) => uploadImage(e, "thumbnail")} />
              </label>
            </div>
            {form.thumbnail && <img className="preview" src={form.thumbnail} alt="" />}
          </label>

          <label className="full">
            Screenshots
            <div className="upload-row">
              <label className="upload-btn">
                {uploading ? "..." : "+ Add Images"}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => uploadImage(e, "screenshots")} />
              </label>
            </div>
            <div className="shots-preview">
              {form.screenshots.map((s, i) => (
                <span key={i} className="shot">
                  <img src={s} alt="" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, screenshots: f.screenshots.filter((_, j) => j !== i) }))}>×</button>
                </span>
              ))}
            </div>
          </label>

          <label className="full">
            Short Description
            <input value={form.shortDescription} onChange={set("shortDescription")} />
          </label>

          <label className="full">
            Description (HTML allowed)
            <textarea rows={5} value={form.description} onChange={set("description")} />
          </label>

          <label className="full">
            Features (one per line)
            <textarea
              rows={4}
              value={featuresText}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
            />
          </label>

          <label>
            Demo URL
            <input value={form.demoUrl} onChange={set("demoUrl")} />
          </label>

          <label>
            Download URL *
            <input value={form.downloadUrl} onChange={set("downloadUrl")} placeholder="Protected file URL" />
          </label>

          <label>
            Single Price ₹ (0 = membership only)
            <input type="number" min="0" value={form.price} onChange={set("price")} placeholder="e.g. 199" />
          </label>

          <label>
            Status
            <select value={form.status} onChange={set("status")}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={form.membershipRequired} onChange={set("membershipRequired")} />
            Membership Required
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={form.isFeatured} onChange={set("isFeatured")} />
            Featured on Home
          </label>
        </div>

        <div className="form-actions">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Product"}</button>
          <button type="button" className="btn-outline" onClick={() => navigate("/admin/products")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
