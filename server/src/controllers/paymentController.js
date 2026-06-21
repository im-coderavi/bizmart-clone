import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";
import { asyncHandler } from "../utils/helpers.js";
import { sendEmail, templates } from "../utils/email.js";
import { uploadBuffer, cloudinaryEnabled } from "../config/cloudinary.js";

// POST /api/payments/create-order  { planId }  OR  { productId }
// Creates a pending payment record and returns the UPI/QR details to pay to.
export const createOrder = asyncHandler(async (req, res) => {
  const { planId, productId } = req.body;
  const settings = await Setting.get();
  const payDetails = {
    upiId: settings.payment.upiId,
    payeeName: settings.payment.payeeName,
    qrImage: settings.payment.qrImage,
    instructions: settings.payment.instructions,
  };

  // ---- Single product purchase ----
  if (productId) {
    const product = await Product.findById(productId);
    if (!product || product.status !== "published")
      return res.status(404).json({ message: "Product not found" });
    if (!product.price || product.price <= 0)
      return res.status(400).json({
        message: "This product is available with membership only",
      });

    let payment = await Payment.findOne({
      user: req.user._id,
      product: product._id,
      status: { $in: ["created", "pending"] },
    });
    if (!payment) {
      payment = await Payment.create({
        user: req.user._id,
        kind: "product",
        product: product._id,
        amount: product.price,
        currency: "INR",
        gateway: "upi",
        status: "created",
        orderId: `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      });
    }
    return res.json({
      paymentId: payment._id,
      kind: "product",
      amount: product.price,
      currency: "INR",
      status: payment.status,
      product: { _id: product._id, name: product.name, slug: product.slug },
      payment: payDetails,
    });
  }

  // ---- Membership purchase ----
  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) return res.status(404).json({ message: "Plan not found" });

  let payment = await Payment.findOne({
    user: req.user._id,
    plan: plan._id,
    kind: "membership",
    status: { $in: ["created", "pending"] },
  });
  if (!payment) {
    payment = await Payment.create({
      user: req.user._id,
      kind: "membership",
      plan: plan._id,
      amount: plan.price,
      currency: "INR",
      gateway: "upi",
      status: "created",
      orderId: `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    });
  }
  res.json({
    paymentId: payment._id,
    kind: "membership",
    amount: plan.price,
    currency: "INR",
    status: payment.status,
    plan: { _id: plan._id, name: plan.name, price: plan.price },
    payment: payDetails,
  });
});

// POST /api/payments/:id/submit  (multipart: utr, screenshot file)
// User submits proof of payment; status -> pending (awaiting admin review).
export const submitPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("plan product");
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  if (String(payment.user) !== String(req.user._id))
    return res.status(403).json({ message: "Not your payment" });
  if (payment.status === "paid")
    return res.status(400).json({ message: "This payment is already approved" });

  const utr = (req.body.utr || "").trim();
  if (!utr) return res.status(400).json({ message: "UTR / Transaction ID is required" });

  let screenshotUrl = req.body.screenshot || "";
  if (req.file) {
    if (!cloudinaryEnabled())
      return res.status(500).json({ message: "Image storage not configured" });
    screenshotUrl = await uploadBuffer(req.file.buffer, "marketplace/payments");
  }
  if (!screenshotUrl)
    return res.status(400).json({ message: "Payment screenshot is required" });

  payment.utr = utr;
  payment.screenshot = screenshotUrl;
  payment.status = "pending";
  await payment.save();

  const itemName =
    payment.kind === "product" ? payment.product?.name : payment.plan?.name;
  sendEmail({
    to: req.user.email,
    ...templates.paymentSubmitted(req.user.name, payment.amount, itemName || "your order"),
  }).catch(() => {});

  res.json({
    message: "Payment submitted! Access will be granted after admin verification.",
    status: payment.status,
  });
});

// GET /api/payments/mine  — current user's payment history/status
export const myPayments = asyncHandler(async (req, res) => {
  const items = await Payment.find({ user: req.user._id })
    .populate("plan", "name price")
    .populate("product", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items });
});
