import User from "../models/User.js";
import Product from "../models/Product.js";
import Download from "../models/Download.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../utils/helpers.js";

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeMembers,
    totalProducts,
    downloadsToday,
    totalDownloads,
    revenueAgg,
    membershipSales,
    recentPayments,
    topProducts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ "membership.isActive": true }),
    Product.countDocuments(),
    Download.countDocuments({ createdAt: { $gte: startOfToday } }),
    Download.countDocuments(),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.countDocuments({ status: "paid" }),
    Payment.find({ status: "paid" })
      .populate("user", "name email")
      .populate("plan", "name")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Download.aggregate([
      { $group: { _id: "$product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // resolve top product names
  const topIds = topProducts.map((t) => t._id);
  const prods = await Product.find({ _id: { $in: topIds } }).select("name").lean();
  const nameMap = Object.fromEntries(prods.map((p) => [String(p._id), p.name]));

  res.json({
    totalUsers,
    activeMembers,
    totalProducts,
    downloadsToday,
    totalDownloads,
    revenue: revenueAgg[0]?.total || 0,
    membershipSales,
    recentPayments,
    topProducts: topProducts.map((t) => ({
      name: nameMap[String(t._id)] || "Unknown",
      count: t.count,
    })),
  });
});

/* ---------------- Users ---------------- */
export const listUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search)
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  const pageNum = Math.max(1, Number(page));
  const perPage = Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter)
      .populate("membership.plan", "name")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    User.countDocuments(filter),
  ]);
  res.json({
    items: items.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isBlocked: u.isBlocked,
      membership: u.membership,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    })),
    page: pageNum,
    pages: Math.ceil(total / perPage),
    total,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("membership.plan", "name").lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  const [downloads, subscriptions, payments] = await Promise.all([
    Download.countDocuments({ user: user._id }),
    Subscription.find({ user: user._id }).populate("plan", "name").sort({ createdAt: -1 }).lean(),
    Payment.find({ user: user._id }).populate("plan", "name").sort({ createdAt: -1 }).lean(),
  ]);
  res.json({ user, downloads, subscriptions, payments });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { name, role, isBlocked } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isBlocked !== undefined) user.isBlocked = isBlocked;
  await user.save();
  res.json({ message: "User updated" });
});

// PUT /api/admin/users/:id/membership  { planId, durationDays? }  (manual upgrade)
// PUT /api/admin/users/:id/membership
// body: { planId, mode: "plan" | "lifetime" | "custom", days? }
//   plan     -> use the plan's own durationDays (0 = lifetime)
//   lifetime -> never expires
//   custom   -> expires in `days` days
export const upgradeUserMembership = asyncHandler(async (req, res) => {
  const Plan = (await import("../models/Plan.js")).default;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const plan = await Plan.findById(req.body.planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  const mode = req.body.mode || "plan";
  let expiresAt = null;
  if (mode === "lifetime") {
    expiresAt = null;
  } else if (mode === "custom") {
    const days = Number(req.body.days) || 0;
    expiresAt = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;
  } else {
    // plan mode — extend from current expiry if still active, else from now
    if (plan.durationDays > 0) {
      const base =
        user.membership?.isActive && user.membership.expiresAt > new Date()
          ? new Date(user.membership.expiresAt)
          : new Date();
      expiresAt = new Date(base.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    }
  }

  await Subscription.create({
    user: user._id,
    plan: plan._id,
    amount: 0,
    expiresAt,
    status: "active",
  });
  user.membership = { isActive: true, plan: plan._id, expiresAt };
  await user.save();

  // notify the user
  const { sendEmail, templates } = await import("../utils/email.js");
  sendEmail({
    to: user.email,
    ...templates.membershipActivated(user.name, plan.name, expiresAt),
  }).catch(() => {});

  res.json({ message: "Membership granted", membership: user.membership });
});

// DELETE /api/admin/users/:id/membership  — revoke membership
export const revokeUserMembership = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await Subscription.updateMany(
    { user: user._id, status: "active" },
    { $set: { status: "cancelled" } }
  );
  user.membership = { isActive: false, plan: undefined, expiresAt: undefined };
  await user.save();

  res.json({ message: "Membership revoked" });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id))
    return res.status(400).json({ message: "You cannot delete your own account" });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
});

/* ---------------- Downloads tracking ---------------- */
export const listDownloads = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const perPage = Number(limit);
  const [items, total] = await Promise.all([
    Download.find()
      .populate("user", "name email")
      .populate("product", "name slug")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    Download.countDocuments(),
  ]);
  res.json({ items, page: pageNum, pages: Math.ceil(total / perPage), total });
});

/* ---------------- Payments management ---------------- */
export const listPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const pageNum = Math.max(1, Number(page));
  const perPage = Number(limit);
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate("user", "name email")
      .populate("plan", "name")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean(),
    Payment.countDocuments(filter),
  ]);
  res.json({ items, page: pageNum, pages: Math.ceil(total / perPage), total });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  payment.status = "refunded";
  payment.refundReason = req.body.reason || "Refunded by admin";
  await payment.save();
  res.json({ message: "Payment marked as refunded" });
});

// PUT /api/admin/payments/:id/approve  — verify UPI/QR payment & activate membership
export const approvePayment = asyncHandler(async (req, res) => {
  const { activateMembership } = await import("../utils/membership.js");
  const payment = await Payment.findById(req.params.id).populate("plan");
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  if (payment.status === "paid")
    return res.status(400).json({ message: "Payment already approved" });

  const user = await User.findById(payment.user);
  if (!user) return res.status(404).json({ message: "User not found" });

  payment.status = "paid";
  payment.paymentId = payment.utr || `manual_${Date.now()}`;
  payment.reviewedBy = req.user._id;
  payment.reviewedAt = new Date();
  await payment.save();

  await activateMembership(user, payment.plan, payment);

  res.json({ message: "Payment approved & membership activated" });
});

// PUT /api/admin/payments/:id/reject  { reason }
export const rejectPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("plan");
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  payment.status = "rejected";
  payment.rejectReason = req.body.reason || "Payment could not be verified";
  payment.reviewedBy = req.user._id;
  payment.reviewedAt = new Date();
  await payment.save();

  const user = await User.findById(payment.user);
  if (user) {
    const { sendEmail, templates } = await import("../utils/email.js");
    sendEmail({
      to: user.email,
      ...templates.paymentRejected(user.name, payment.plan?.name || "your plan", payment.rejectReason),
    }).catch(() => {});
  }

  res.json({ message: "Payment rejected" });
});
