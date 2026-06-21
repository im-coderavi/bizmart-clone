import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Lifetime Premium"
    slug: { type: String, required: true, unique: true, lowercase: true },
    billingType: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      default: "lifetime",
    },
    price: { type: Number, required: true }, // current price (e.g. 499)
    originalPrice: { type: Number, default: 0 }, // for "save %" display
    durationDays: { type: Number, default: 0 }, // 0 = lifetime
    description: { type: String, default: "" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
