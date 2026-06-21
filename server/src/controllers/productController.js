import Product from "../models/Product.js";
import Download from "../models/Download.js";
import { asyncHandler, uniqueSlug } from "../utils/helpers.js";

// GET /api/products  (public listing with filters)
export const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category, // slug or id
    type,
    minPrice,
    maxPrice,
    sort = "latest",
    featured,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { status: "published" };
  if (type) filter.type = type;
  if (featured === "true") filter.isFeatured = true;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (category) {
    // accept either ObjectId or category slug
    if (/^[0-9a-fA-F]{24}$/.test(category)) filter.category = category;
    else {
      const Category = (await import("../models/Category.js")).default;
      const cat = await Category.findOne({ slug: category }).lean();
      filter.category = cat ? cat._id : null;
    }
  }

  const sortMap = {
    latest: { createdAt: -1 },
    popular: { downloadsCount: -1 },
    rating: { ratingAvg: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    name: { name: 1 },
  };

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(60, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortMap[sort] || sortMap.latest)
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page: pageNum,
    pages: Math.ceil(total / perPage),
    total,
  });
});

// GET /api/products/suggest?q=  (instant search)
export const suggestProducts = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ items: [] });
  const items = await Product.find({
    status: "published",
    name: { $regex: q, $options: "i" },
  })
    .select("name slug thumbnail type")
    .limit(8)
    .lean();
  res.json({ items });
});

// GET /api/updates  — latest added/updated products feed
export const listUpdates = asyncHandler(async (req, res) => {
  const limit = Math.min(60, Number(req.query.limit) || 40);
  const items = await Product.find({ status: "published" })
    .populate("category", "name slug")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  const feed = items.map((p) => {
    // "new" if it hasn't been edited since creation (within 60s window)
    const isNew = Math.abs(new Date(p.updatedAt) - new Date(p.createdAt)) < 60 * 1000;
    const lastChange = p.changelog?.length ? p.changelog[p.changelog.length - 1] : null;
    return {
      _id: p._id,
      name: p.name,
      slug: p.slug,
      thumbnail: p.thumbnail,
      type: p.type,
      category: p.category,
      version: p.version,
      updatedAt: p.updatedAt,
      kind: isNew ? "new" : "updated",
      note: lastChange?.notes || "",
    };
  });

  res.json({ items: feed });
});

// GET /api/products/:slug
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category", "name slug")
    .lean();
  if (!product) return res.status(404).json({ message: "Product not found" });

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category?._id,
    status: "published",
  })
    .select("name slug thumbnail type ratingAvg downloadsCount price")
    .limit(4)
    .lean();

  res.json({ product, related });
});

/* ---------------- Admin ---------------- */

// GET /api/admin/products
export const adminListProducts = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, Number(page));
  const perPage = Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ items, page: pageNum, pages: Math.ceil(total / perPage), total });
});

export const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = await uniqueSlug(Product, body.slug || body.name);
  const product = await Product.create(body);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const body = { ...req.body };
  if (body.name && !body.slug) body.slug = product.slug;
  if (body.slug && body.slug !== product.slug)
    body.slug = await uniqueSlug(Product, body.slug, product._id);

  Object.assign(product, body);
  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
});
