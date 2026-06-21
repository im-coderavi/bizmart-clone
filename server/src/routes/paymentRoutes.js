import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { createOrder, submitPayment, myPayments } from "../controllers/paymentController.js";

const router = Router();
router.use(protect);

router.post("/create-order", createOrder);
router.post("/:id/submit", upload.single("screenshot"), submitPayment);
router.get("/mine", myPayments);

export default router;
