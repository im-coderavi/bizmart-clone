import Blog from "../models/Blog.js";
import { asyncHandler, uniqueSlug } from "../utils/helpers.js";

// GET /api/blogs  (public)
export const listBlogs = asyncHandler(async (req, res) => {
  const { search, category, tag, page = 1, limit = 9 } = req.query;
  const filter = { status: "published" };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(1, Number(page));
  const perPage = Number(limit);
  const [items, total] = await Promise.all([
    Blog.find(filter)
      .select("-content -comments")
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    Blog.countDocuments(filter),
  ]);
  res.json({ items, page: pageNum, pages: Math.ceil(total / perPage), total });
});

// GET /api/blogs/:slug
export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("author", "name")
    .lean();
  if (!blog) return res.status(404).json({ message: "Post not found" });

  const related = await Blog.find({
    _id: { $ne: blog._id },
    status: "published",
    category: blog.category,
  })
    .select("title slug coverImage createdAt")
    .limit(3)
    .lean();

  res.json({ blog, related });
});

// POST /api/blogs/:slug/comments  (logged-in)
export const addComment = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: "Post not found" });
  blog.comments.push({
    user: req.user._id,
    name: req.user.name,
    text: req.body.text,
  });
  await blog.save();
  res.status(201).json({ comments: blog.comments });
});

/* ---------------- Admin ---------------- */
export const adminListBlogs = asyncHandler(async (req, res) => {
  const items = await Blog.find().select("-content").populate("author", "name").sort({ createdAt: -1 }).lean();
  res.json({ items });
});

export const adminGetBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).lean();
  if (!blog) return res.status(404).json({ message: "Post not found" });
  res.json({ blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  const body = { ...req.body, author: req.user._id };
  body.slug = await uniqueSlug(Blog, body.slug || body.title);
  const blog = await Blog.create(body);
  res.status(201).json({ blog });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Post not found" });
  const body = { ...req.body };
  if (body.slug && body.slug !== blog.slug)
    body.slug = await uniqueSlug(Blog, body.slug, blog._id);
  Object.assign(blog, body);
  await blog.save();
  res.json({ blog });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ message: "Post not found" });
  res.json({ message: "Post deleted" });
});
