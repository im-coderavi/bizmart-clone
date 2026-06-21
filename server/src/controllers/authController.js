import crypto from "crypto";
import User from "../models/User.js";
import { asyncHandler, signToken } from "../utils/helpers.js";
import { sendEmail, templates } from "../utils/email.js";

function publicUser(u) {
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    favorites: u.favorites,
    membership: {
      isActive: u.hasActiveMembership(),
      plan: u.membership?.plan,
      expiresAt: u.membership?.expiresAt,
    },
    createdAt: u.createdAt,
  };
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password });
  user.lastLoginAt = new Date();
  await user.save();

  sendEmail({ to: user.email, ...templates.welcome(user.name) }).catch(() => {});

  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid email or password" });
  if (user.isBlocked) return res.status(403).json({ message: "Your account is blocked" });

  user.lastLoginAt = new Date();
  await user.save();

  res.json({ token: signToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, avatar, password } = req.body;
  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (password) user.password = password;
  await user.save();
  res.json({ user: publicUser(user) });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  // Always respond success to avoid email enumeration
  if (user) {
    const token = user.createResetToken();
    await user.save({ validateBeforeSave: false });
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    sendEmail({ to: user.email, ...templates.resetPassword(user.name, link) }).catch(() => {});
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
});

// POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ token: signToken(user._id), user: publicUser(user) });
});

export { publicUser };
