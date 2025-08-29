import Cart from "../models/cartModel.js";
import MenuItem from "../models/MenuItem.js";

//  Add item to cart
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

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    // Clear any applied discount when cart changes (after population)
    if (populatedCart.appliedDiscount) {
      populatedCart.clearDiscount();
      await populatedCart.save();
    }

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get user cart
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

//  Remove item from cart (DELETE method)
export const removeFromCart = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    // Clear any applied discount when cart changes (after population)
    if (populatedCart.appliedDiscount) {
      populatedCart.clearDiscount();
      await populatedCart.save();
    }

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Remove item from cart (POST method - alternative for better compatibility)
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

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    // Clear any applied discount when cart changes (after population)
    if (populatedCart.appliedDiscount) {
      populatedCart.clearDiscount();
      await populatedCart.save();
    }

    res.json({
      message: "Item removed from cart successfully",
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply discount to cart by code
export const applyDiscountToCart = async (req, res) => {
  try {
    const { discountCode } = req.body;

    if (!discountCode) {
      return res.status(400).json({ message: "Discount code is required" });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.menuItem');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Simple discount validation - only SAVE10 works for now
    if (discountCode.toUpperCase() !== "SAVE10") {
      return res.status(400).json({ message: "Invalid discount code" });
    }

    // Calculate totals
    const totalBeforeDiscount = cart.items.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);

    const discountAmount = totalBeforeDiscount * 0.1; // 10% off
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    // Update cart
    cart.totalBeforeDiscount = totalBeforeDiscount;
    cart.discountAmount = discountAmount;
    cart.totalAfterDiscount = totalAfterDiscount;

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem');

    res.json({
      message: "Discount applied successfully",
      cart: updatedCart,
      discount: {
        code: discountCode,
        amount: discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Update item quantity in cart
export const updateCartItem = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid menuItemId and quantity are required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.menuItem')
      .populate('appliedDiscount');

    // Clear any applied discount when cart changes (after population)
    if (populatedCart.appliedDiscount) {
      populatedCart.clearDiscount();
      await populatedCart.save();
    }

    res.json({
      message: "Cart item updated successfully",
      cart: populatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Clear entire cart
export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear all items and discount
    cart.items = [];
    cart.appliedDiscount = null;
    cart.discountAmount = 0;
    cart.totalBeforeDiscount = 0;
    cart.totalAfterDiscount = 0;
    await cart.save();

    res.json({
      message: "Cart cleared successfully",
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Remove discount from cart
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
