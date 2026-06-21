import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(
  cors({
    origin: true, // reflect request origin (dev). Tighten in production.
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// static uploads
app.use("/uploads", express.static(uploadsDir));

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date() }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("   Make sure MongoDB is running, or set MONGO_URI in server/.env");
    process.exit(1);
  });
