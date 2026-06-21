import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

export default function BlogPost() {
  const { slug } = useParams();
  const { isAuthed } = useAuth();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/blogs/${slug}`)
      .then((r) => {
        setBlog(r.data.blog);
        setRelated(r.data.related);
        setComments(r.data.blog.comments || []);
      })
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/blogs/${slug}/comments`, { text: comment });
      setComments(data.comments);
      setComment("");
    } catch {
      /* ignore */
    }
  };

  if (loading) return <div className="page-wrap"><Loader /></div>;
  if (!blog)
    return (
      <div className="page-wrap">
        <div className="page-message">Post not found. <Link to="/blog">Back to blog</Link></div>
      </div>
    );

  return (
    <div className="page-wrap post-page">
      <article className="post">
        <div className="post-head">
          <span className="blog-cat">{blog.category}</span>
          <h1>{blog.title}</h1>
          <div className="post-meta">
            <span>{blog.author?.name || "Admin"}</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>{blog.views} views</span>
          </div>
        </div>
        {blog.coverImage && <img className="post-cover" src={blog.coverImage} alt={blog.title} />}
        <div className="rich" dangerouslySetInnerHTML={{ __html: blog.content }} />

        {blog.tags?.length > 0 && (
          <div className="post-tags">
            {blog.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}

        <section className="comments">
          <h2>Comments ({comments.length})</h2>
          {comments.map((c, i) => (
            <div className="comment" key={i}>
              <strong>{c.name}</strong>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              <p>{c.text}</p>
            </div>
          ))}

          {isAuthed ? (
            <form className="comment-form" onSubmit={postComment}>
              <textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn-primary">Post Comment</button>
            </form>
          ) : (
            <p className="muted">
              <Link to="/login">Login</Link> to leave a comment.
            </p>
          )}
        </section>
      </article>

      {related.length > 0 && (
        <aside className="post-related">
          <h3>Related Posts</h3>
          {related.map((r) => (
            <Link to={`/blog/${r.slug}`} key={r._id} className="related-item">
              {r.coverImage && <img src={r.coverImage} alt="" />}
              <span>{r.title}</span>
            </Link>
          ))}
        </aside>
      )}
    </div>
  );
}
