import Discount from "../models/Discount.js";
import DiscountService from "../services/discountService.js";
import Cart from "../models/cartModel.js";

// ===== ADMIN DISCOUNT MANAGEMENT =====

// @desc Get all discounts (Admin)
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('specific_items', 'name category price')
      .sort({ createdAt: -1 });
    
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching discounts", error: error.message });
  }
};

// @desc Get single discount (Admin)
export const getDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id)
      .populate('specific_items', 'name category price');
    
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: "Error fetching discount", error: error.message });
  }
};

// @desc Create new discount (Admin)
export const createDiscount = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      value,
      min_order_value,
      valid_from,
      valid_to,
      max_uses,
      max_uses_per_customer,
      is_active,
      specific_items
    } = req.body;

    // Validation
    if (!name || !type || value === undefined || !valid_from || !valid_to) {
      return res.status(400).json({ 
        message: "Name, type, value, valid_from, and valid_to are required" 
      });
    }

    // Validate discount type
    if (!["percentage", "fixed", "item_specific"].includes(type)) {
      return res.status(400).json({ 
        message: "Type must be percentage, fixed, or item_specific" 
      });
    }

    // Validate dates
    if (new Date(valid_from) >= new Date(valid_to)) {
      return res.status(400).json({ 
        message: "Valid from date must be before valid to date" 
      });
    }

    // For item-specific discounts, specific_items is required
    if (type === "item_specific" && (!specific_items || specific_items.length === 0)) {
      return res.status(400).json({ 
        message: "Specific items are required for item-specific discounts" 
      });
    }

    const discount = await Discount.create({
      name,
      description,
      type,
      value,
      min_order_value: min_order_value || 0,
      valid_from,
      valid_to,
      max_uses,
      max_uses_per_customer,
      is_active: is_active !== undefined ? is_active : true,
      specific_items: type === "item_specific" ? specific_items : []
    });

    const populatedDiscount = await Discount.findById(discount._id)
      .populate('specific_items', 'name category price');

    res.status(201).json(populatedDiscount);
  } catch (error) {
    res.status(500).json({ message: "Error creating discount", error: error.message });
  }
};

// @desc Update discount (Admin)
export const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    const {
      name,
      description,
      type,
      value,
      min_order_value,
      valid_from,
      valid_to,
      max_uses,
      max_uses_per_customer,
      is_active,
      specific_items
    } = req.body;

    // Validate dates if provided
    const newValidFrom = valid_from || discount.valid_from;
    const newValidTo = valid_to || discount.valid_to;
    
    if (new Date(newValidFrom) >= new Date(newValidTo)) {
      return res.status(400).json({ 
        message: "Valid from date must be before valid to date" 
      });
    }

    // Update fields
    if (name !== undefined) discount.name = name;
    if (description !== undefined) discount.description = description;
    if (type !== undefined) discount.type = type;
    if (value !== undefined) discount.value = value;
    if (min_order_value !== undefined) discount.min_order_value = min_order_value;
    if (valid_from !== undefined) discount.valid_from = valid_from;
    if (valid_to !== undefined) discount.valid_to = valid_to;
    if (max_uses !== undefined) discount.max_uses = max_uses;
    if (max_uses_per_customer !== undefined) discount.max_uses_per_customer = max_uses_per_customer;
    if (is_active !== undefined) discount.is_active = is_active;
    if (specific_items !== undefined) discount.specific_items = specific_items;

    await discount.save();

    const updatedDiscount = await Discount.findById(discount._id)
      .populate('specific_items', 'name category price');

    res.json(updatedDiscount);
  } catch (error) {
    res.status(500).json({ message: "Error updating discount", error: error.message });
  }
};

// @desc Delete discount (Admin)
export const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting discount", error: error.message });
  }
};

// ===== CUSTOMER DISCOUNT OPERATIONS =====

// @desc Get available discounts for customer
export const getAvailableDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountService.getAvailableDiscounts(req.user._id);
    
    // Return only necessary fields for customers
    const customerDiscounts = discounts.map(discount => ({
      _id: discount._id,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      min_order_value: discount.min_order_value,
      valid_to: discount.valid_to,
      specific_items: discount.specific_items
    }));

    res.json(customerDiscounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available discounts", error: error.message });
  }
};

// @desc Apply discount to cart by ID or code
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

    res.json({
      message: "Discount applied successfully",
      discount: {
        _id: result.discount._id,
        name: result.discount.name,
        code: result.discount.code,
        type: result.discount.type,
        value: result.discount.value
      },
      totals: {
        totalBeforeDiscount: result.totalBeforeDiscount,
        discountAmount: result.discountAmount,
        totalAfterDiscount: result.totalAfterDiscount
      },
      isValid: true
    });
  } catch (error) {
    res.status(500).json({ message: "Error applying discount", error: error.message });
  }
};
