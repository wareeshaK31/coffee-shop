import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

// 🛒 Place new order from cart
export const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.menuItem");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Total price calculation
    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.menuItem.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.user._id,
      items: cart.items,
      totalPrice,
    });

    await order.save();

    // clear cart after placing order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👤 Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.menuItem");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👑 Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user items.menuItem");
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

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
