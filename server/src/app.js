import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import { notFound, errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

/**
 * Cached MongoDB connection — reused across warm serverless invocations so we
 * don't open a new connection on every request.
 */
let cached = globalThis.__mongo;
if (!cached) cached = globalThis.__mongo = { conn: null, promise: null };

export async function connectOnce() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/digital_marketplace";
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri).then((m) => {
      console.log(`✅ MongoDB connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default app;
