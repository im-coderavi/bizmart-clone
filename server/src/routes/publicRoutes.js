import { Router } from "express";
import {
  listProducts,
  suggestProducts,
  getProduct,
  listUpdates,
} from "../controllers/productController.js";
import { listCategories } from "../controllers/categoryController.js";
import { listPlans } from "../controllers/planController.js";
import { listBlogs, getBlog, addComment } from "../controllers/blogController.js";
import { getPublicPaymentSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Products
router.get("/products", listProducts);
router.get("/products/suggest", suggestProducts);
router.get("/updates", listUpdates);
router.get("/products/:slug", getProduct);

// Categories
router.get("/categories", listCategories);

// Plans
router.get("/plans", listPlans);

// Payment settings (UPI / QR for checkout)
router.get("/settings/payment", getPublicPaymentSettings);

// Blogs
router.get("/blogs", listBlogs);
router.get("/blogs/:slug", getBlog);
router.post("/blogs/:slug/comments", protect, addComment);

export default router;
