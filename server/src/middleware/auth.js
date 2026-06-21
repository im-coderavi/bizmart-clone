import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/helpers.js";

function getToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

// Requires a valid logged-in user
export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ message: "User not found" });
  if (user.isBlocked) return res.status(403).json({ message: "Your account is blocked" });

  req.user = user;
  next();
});

// Attaches user if token present, but does not block guests
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isBlocked) req.user = user;
    } catch {
      /* ignore */
    }
  }
  next();
});

export const admin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Requires an active membership (used for downloads / member area)
export const requireMembership = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  if (!req.user?.hasActiveMembership()) {
    return res.status(403).json({ message: "Active membership required", needMembership: true });
  }
  next();
};
