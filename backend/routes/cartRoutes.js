import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  removeFromCartPost,
  updateCartItem,
  clearCart,
  applyDiscountToCart,
  removeDiscountFromCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);         // ➕ Add to cart
router.get("/", protect, getCart);               // 📦 Get user cart
router.put("/update", protect, updateCartItem);  // ✏️ Update item quantity
router.delete("/:menuItemId", protect, removeFromCart); // ❌ Remove item (DELETE)
router.post("/remove", protect, removeFromCartPost); // ❌ Remove item (POST)
router.delete("/clear", protect, clearCart);     // 🗑️ Clear entire cart
router.post("/apply-discount", protect, applyDiscountToCart); // 🎫 Apply discount
router.delete("/discount", protect, removeDiscountFromCart); // 🗑️ Remove discount

export default router;
