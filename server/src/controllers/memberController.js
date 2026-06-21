import Product from "../models/Product.js";
import Download from "../models/Download.js";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../utils/helpers.js";

// GET /api/member/download/:productId  (membership required)
export const downloadProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product || product.status !== "published")
    return res.status(404).json({ message: "Product not found" });

  if (!product.downloadUrl)
    return res.status(400).json({ message: "Download not available for this product yet" });

  // record the download
  await Download.create({
    user: req.user._id,
    product: product._id,
    version: product.version,
    ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
    userAgent: req.headers["user-agent"] || "",
  });
  product.downloadsCount += 1;
  await product.save();

  // return a (time-aware) protected url; in production this could be a signed URL
  res.json({
    url: product.downloadUrl,
    name: product.name,
    version: product.version,
    fileSize: product.fileSize,
  });
});

// GET /api/member/downloads  (history)
export const myDownloads = asyncHandler(async (req, res) => {
  const items = await Download.find({ user: req.user._id })
    .populate("product", "name slug thumbnail type version")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ items });
});

/* ---------------- Favorites ---------------- */

// GET /api/member/favorites
export const getFavorites = asyncHandler(async (req, res) => {
  await req.user.populate({
    path: "favorites",
    select: "name slug thumbnail type ratingAvg downloadsCount price",
  });
  res.json({ items: req.user.favorites });
});

// POST /api/member/favorites/:productId  (toggle)
export const toggleFavorite = asyncHandler(async (req, res) => {
  const id = req.params.productId;
  const idx = req.user.favorites.findIndex((f) => String(f) === id);
  if (idx >= 0) req.user.favorites.splice(idx, 1);
  else req.user.favorites.push(id);
  await req.user.save();
  res.json({ favorites: req.user.favorites });
});

/* ---------------- Dashboard ---------------- */

// GET /api/member/dashboard
export const myDashboard = asyncHandler(async (req, res) => {
  const [downloadCount, recentDownloads, subscription] = await Promise.all([
    Download.countDocuments({ user: req.user._id }),
    Download.find({ user: req.user._id })
      .populate("product", "name slug thumbnail version")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Subscription.findOne({ user: req.user._id, status: "active" })
      .populate("plan", "name billingType price")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  res.json({
    profile: {
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      memberSince: req.user.createdAt,
    },
    membership: {
      isActive: req.user.hasActiveMembership(),
      plan: subscription?.plan || null,
      expiresAt: req.user.membership?.expiresAt || null,
    },
    stats: {
      downloads: downloadCount,
      favorites: req.user.favorites.length,
    },
    recentDownloads,
  });
});
