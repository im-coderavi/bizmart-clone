import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // a payment is either for a membership plan OR a single product
    kind: { type: String, enum: ["membership", "product"], default: "membership" },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    gateway: {
      type: String,
      enum: ["razorpay", "payu", "stripe", "phonepe", "upi", "qr", "mock"],
      default: "upi",
    },

    // Manual UPI/QR verification details submitted by the user
    utr: { type: String, default: "" }, // UTR / transaction reference number
    screenshot: { type: String, default: "" }, // Cloudinary URL of payment proof

    orderId: { type: String, default: "" },
    paymentId: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "created", // order created, awaiting user payment
        "pending", // user submitted UTR+screenshot, awaiting admin review
        "paid", // admin approved -> membership activated
        "rejected", // admin rejected
        "failed",
        "refunded",
        "refund_requested",
      ],
      default: "created",
    },

    rejectReason: { type: String, default: "" },
    refundReason: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
