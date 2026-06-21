import "dotenv/config";
import app, { connectOnce } from "./app.js";

const PORT = process.env.PORT || 5000;

connectOnce()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("   Make sure MongoDB is running, or set MONGO_URI in server/.env");
    process.exit(1);
  });
