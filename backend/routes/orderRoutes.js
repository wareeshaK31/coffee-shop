import express from "express";
import { placeOrder, getUserOrders, getOrderDetails, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/place", protect, placeOrder);          // 🛒 Place order
router.get("/my-orders", protect, getUserOrders);    // 👤 User orders
router.get("/:orderId", protect, getOrderDetails);   // 👤 Get specific order details
router.get("/", protect, isAdmin, getAllOrders);       // 👑 Admin get all
router.put("/:orderId", protect, isAdmin, updateOrderStatus); // 👑 Admin update

export default router;
