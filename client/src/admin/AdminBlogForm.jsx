import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";

const empty = {
  title: "", excerpt: "", content: "", coverImage: "", category: "General",
  tags: [], status: "published", metaTitle: "", metaDescription: "",
};

export default function AdminBlogForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/admin/blogs/${id}`).then((r) => {
      setForm({ ...empty, ...r.data.blog });
      setLoading(false);
    });
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const uploadCover = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("files", e.target.files[0]);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((f) => ({ ...f, coverImage: data.url }));
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
      tags: Array.isArray(form.tags) ? form.tags : String(form.tags).split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.put(`/admin/blogs/${id}`, payload);
      else await api.post("/admin/blogs", payload);
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.uiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  const tagsText = Array.isArray(form.tags) ? form.tags.join(", ") : form.tags;

  return (
    <div className="admin-page">
      <div className="admin-page-head"><h1>{editing ? "Edit Post" : "New Post"}</h1></div>
      {error && <div className="auth-error">{error}</div>}

      <form className="admin-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="full">Title *<input value={form.title} onChange={set("title")} required /></label>
          <label>Category<input value={form.category} onChange={set("category")} /></label>
          <label>Status
            <select value={form.status} onChange={set("status")}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label className="full">Cover Image
            <div className="upload-row">
              <input value={form.coverImage} onChange={set("coverImage")} placeholder="Image URL or upload" />
              <label className="upload-btn">
                {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" hidden onChange={uploadCover} />
              </label>
            </div>
            {form.coverImage && <img className="preview" src={form.coverImage} alt="" />}
          </label>
          <label className="full">Excerpt<input value={form.excerpt} onChange={set("excerpt")} /></label>
          <label className="full">Content (HTML allowed)<textarea rows={12} value={form.content} onChange={set("content")} /></label>
          <label className="full">Tags (comma separated)<input value={tagsText} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} /></label>
          <label className="full">Meta Description (SEO)<input value={form.metaDescription} onChange={set("metaDescription")} /></label>
        </div>
        <div className="form-actions">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Post"}</button>
          <button type="button" className="btn-outline" onClick={() => navigate("/admin/blogs")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
