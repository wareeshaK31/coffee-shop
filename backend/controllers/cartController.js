import Cart from "../models/cartModel.js";
import DiscountService from "../services/discountService.js";

// ➕ Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid menuItemId and quantity are required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ menuItem: menuItemId, quantity });
    }

    // Clear any applied discount when cart changes
    cart.clearDiscount();

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.menuItem")
      .populate("appliedDiscount");

    if (!cart) {
      return res.json({
        items: [],
        appliedDiscount: null,
        totalBeforeDiscount: 0,
        discountAmount: 0,
        totalAfterDiscount: 0
      });
    }

    // Recalculate totals if no discount applied
    if (!cart.appliedDiscount) {
      const totalBeforeDiscount = cart.items.reduce((total, item) => {
        return total + (item.menuItem.price * item.quantity);
      }, 0);
      cart.totalBeforeDiscount = totalBeforeDiscount;
      cart.totalAfterDiscount = totalBeforeDiscount;
      cart.discountAmount = 0;
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Remove item from cart (DELETE method)
export const removeFromCart = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );

    // Clear any applied discount when cart changes
    cart.clearDiscount();

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Remove item from cart (POST method - alternative for better compatibility)
export const removeFromCartPost = async (req, res) => {
  try {
    const { menuItemId } = req.body;

    if (!menuItemId) {
      return res.status(400).json({ message: "Menu item ID is required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );

    // Clear any applied discount when cart changes
    cart.clearDiscount();

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    res.json({
      message: "Item removed from cart successfully",
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🎫 Apply discount to cart by ID or code
export const applyDiscountToCart = async (req, res) => {
  try {
    const { discountId, discountCode } = req.body;
    const codeOrId = discountCode || discountId;

    if (!codeOrId) {
      return res.status(400).json({ message: "Discount ID or code is required" });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.menuItem');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Apply discount using service (supports both code and ID)
    const result = await DiscountService.applyDiscountByCodeOrId(
      codeOrId,
      cart.items,
      req.user._id
    );

    if (!result.isValid) {
      return res.status(400).json({
        message: result.reason,
        isValid: false
      });
    }

    // Update cart with discount
    cart.appliedDiscount = result.discount._id;
    cart.totalBeforeDiscount = result.totalBeforeDiscount;
    cart.discountAmount = result.discountAmount;
    cart.totalAfterDiscount = result.totalAfterDiscount;

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    res.json({
      message: "Discount applied successfully",
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Remove discount from cart
export const removeDiscountFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear discount
    cart.clearDiscount();
    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    res.json({
      message: "Discount removed successfully",
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
