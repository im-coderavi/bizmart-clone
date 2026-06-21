// Vercel serverless entry — wraps the Express app and ensures the (cached)
// MongoDB connection is ready before handling each request.
import "dotenv/config";
import app, { connectOnce } from "../src/app.js";

export default async function handler(req, res) {
  try {
    await connectOnce();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Database connection failed" }));
    return;
  }
  return app(req, res);
}
