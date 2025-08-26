import express from "express";
import {
  getAllDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAvailableDiscounts,
  applyDiscountToCart
} from "../controllers/discountController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===== CUSTOMER ROUTES =====
// Get available discounts for customer
router.get("/available", protect, getAvailableDiscounts);

// Apply discount to cart
router.post("/apply", protect, applyDiscountToCart);

// ===== ADMIN ROUTES =====
// Get all discounts (Admin only)
router.get("/", protect, isAdmin, getAllDiscounts);

// Get single discount (Admin only)
router.get("/:id", protect, isAdmin, getDiscount);

// Create new discount (Admin only)
router.post("/", protect, isAdmin, createDiscount);

// Update discount (Admin only)
router.put("/:id", protect, isAdmin, updateDiscount);

// Delete discount (Admin only)
router.delete("/:id", protect, isAdmin, deleteDiscount);

export default router;
