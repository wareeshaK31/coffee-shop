import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);         // ➕ Add to cart
router.get("/", protect, getCart);               // 📦 Get user cart
router.delete("/:menuItemId", protect, removeFromCart); // ❌ Remove item

export default router;
