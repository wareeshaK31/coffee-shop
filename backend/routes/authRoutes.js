import express from "express";
import { registerUser, loginUser, getMe, promoteToAdmin } from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/promote-admin", protect, promoteToAdmin);

export default router;
