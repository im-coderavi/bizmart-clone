import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },

    // membership summary (source of truth is the Subscription collection,
    // but we cache the active one here for fast access checks)
    membership: {
      isActive: { type: Boolean, default: false },
      plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
      expiresAt: { type: Date },
    },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.hasActiveMembership = function () {
  return (
    this.membership?.isActive &&
    (!this.membership.expiresAt || this.membership.expiresAt > new Date())
  );
};

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

export default mongoose.model("User", userSchema);
