import { Router } from "express";
import { protect, admin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/helpers.js";
import { uploadBuffer, cloudinaryEnabled } from "../config/cloudinary.js";

import {
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  adminListPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";
import {
  adminListBlogs,
  adminGetBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import {
  getStats,
  listUsers,
  getUser,
  updateUser,
  upgradeUserMembership,
  revokeUserMembership,
  deleteUser,
  listDownloads,
  listPayments,
  refundPayment,
  approvePayment,
  rejectPayment,
} from "../controllers/adminController.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = Router();
router.use(protect, admin);

// Dashboard
router.get("/stats", getStats);

// File upload (images) -> Cloudinary -> returns secure url(s)
router.post(
  "/upload",
  upload.array("files", 10),
  asyncHandler(async (req, res) => {
    if (!cloudinaryEnabled())
      return res.status(500).json({ message: "Cloudinary is not configured" });
    const urls = await Promise.all(
      (req.files || []).map((f) => uploadBuffer(f.buffer, "marketplace"))
    );
    res.json({ urls, url: urls[0] || null });
  })
);

// Products
router.get("/products", adminListProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Categories
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Plans
router.get("/plans", adminListPlans);
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

// Blogs
router.get("/blogs", adminListBlogs);
router.get("/blogs/:id", adminGetBlog);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

// Users
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.put("/users/:id/membership", upgradeUserMembership);
router.delete("/users/:id/membership", revokeUserMembership);
router.delete("/users/:id", deleteUser);

// Downloads tracking
router.get("/downloads", listDownloads);

// Payments
router.get("/payments", listPayments);
router.put("/payments/:id/approve", approvePayment);
router.put("/payments/:id/reject", rejectPayment);
router.put("/payments/:id/refund", refundPayment);

// Settings (UPI / QR payment config)
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
