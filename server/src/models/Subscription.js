import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // null/undefined = lifetime
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
