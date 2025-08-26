import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  applyDiscountToCart,
  removeDiscountFromCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);         // ➕ Add to cart
router.get("/", protect, getCart);               // 📦 Get user cart
router.delete("/:menuItemId", protect, removeFromCart); // ❌ Remove item
router.post("/apply-discount", protect, applyDiscountToCart); // 🎫 Apply discount
router.delete("/discount", protect, removeDiscountFromCart); // 🗑️ Remove discount

export default router;
