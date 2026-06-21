import { Router } from "express";
import { protect, requireMembership } from "../middleware/auth.js";
import {
  downloadProduct,
  myDownloads,
  getFavorites,
  toggleFavorite,
  myDashboard,
} from "../controllers/memberController.js";

const router = Router();
router.use(protect);

router.get("/dashboard", myDashboard);
router.get("/downloads", myDownloads);
router.get("/favorites", getFavorites);
router.post("/favorites/:productId", toggleFavorite);

// download requires an active membership
router.get("/download/:productId", requireMembership, downloadProduct);

export default router;
