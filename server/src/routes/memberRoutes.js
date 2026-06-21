import { Router } from "express";
import { protect } from "../middleware/auth.js";
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

// access (membership / purchased / admin) is checked inside the controller
router.get("/download/:productId", downloadProduct);

export default router;
