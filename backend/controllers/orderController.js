import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import DiscountService from "../services/discountService.js";

// 🛒 Place new order from cart
export const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.menuItem")
      .populate("appliedDiscount");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total before discount
    const totalBeforeDiscount = cart.items.reduce(
      (acc, item) => acc + item.menuItem.price * item.quantity,
      0
    );

    let discountAmount = 0;
    let appliedDiscount = null;

    // If discount is applied, validate and calculate
    if (cart.appliedDiscount) {
      const result = await DiscountService.applyDiscountToCart(
        cart.appliedDiscount,
        cart.items,
        req.user._id
      );

      if (result.isValid) {
        discountAmount = result.discountAmount;
        appliedDiscount = cart.appliedDiscount._id;

        // Increment discount usage
        await DiscountService.incrementUsage(appliedDiscount);
      } else {
        // If discount is no longer valid, remove it from cart
        cart.clearDiscount();
        await cart.save();
        return res.status(400).json({
          message: `Discount is no longer valid: ${result.reason}`
        });
      }
    }

    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    // Create order items with current prices
    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      quantity: item.quantity,
      price: item.menuItem.price // Store price at time of order
    }));

    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      total_before_discount: Math.round(totalBeforeDiscount * 100) / 100,
      discount: appliedDiscount,
      discount_amount: Math.round(discountAmount * 100) / 100,
      total_after_discount: Math.round(totalAfterDiscount * 100) / 100,
      order_date: new Date(),
      status: "pending"
    });

    await order.save();

    // Clear cart after placing order
    cart.items = [];
    cart.clearDiscount();
    await cart.save();

    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("items.menuItem")
      .populate("discount");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👤 Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.menuItem")
      .populate("discount")
      .sort({ order_date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👑 Admin: Get all orders
export const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.menuItem")
      .populate("discount")
      .sort({ order_date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👑 Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "completed", "canceled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: pending, paid, completed, or canceled"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("items.menuItem")
      .populate("discount");

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
