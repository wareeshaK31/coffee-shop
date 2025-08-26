import Discount from "../models/Discount.js";
import Order from "../models/orderModel.js";
import MenuItem from "../models/MenuItem.js";

class DiscountService {
  /**
   * Validate if a discount can be applied to a cart
   * @param {Object} discount - The discount object
   * @param {Array} cartItems - Array of cart items with menuItem and quantity
   * @param {String} customerId - Customer ID
   * @param {Number} totalBeforeDiscount - Total cart value before discount
   * @returns {Object} - { isValid: boolean, reason: string }
   */
  static async validateDiscount(discount, cartItems, customerId, totalBeforeDiscount) {
    try {
      // Check if discount is active
      if (!discount.is_active) {
        return { isValid: false, reason: "Discount is not active" };
      }

      // Check date validity
      const now = new Date();
      if (discount.valid_from > now) {
        return { isValid: false, reason: "Discount is not yet valid" };
      }
      if (discount.valid_to < now) {
        return { isValid: false, reason: "Discount has expired" };
      }

      // Check minimum order value
      if (discount.min_order_value > 0 && totalBeforeDiscount < discount.min_order_value) {
        return { 
          isValid: false, 
          reason: `Minimum order value of $${discount.min_order_value} required` 
        };
      }

      // Check total usage limit
      if (discount.max_uses !== null && discount.current_uses >= discount.max_uses) {
        return { isValid: false, reason: "Discount usage limit exceeded" };
      }

      // Check per-customer usage limit
      if (discount.max_uses_per_customer !== null) {
        const customerUsage = await Order.countDocuments({
          customer: customerId,
          discount: discount._id
        });
        
        if (customerUsage >= discount.max_uses_per_customer) {
          return { 
            isValid: false, 
            reason: "You have already used this discount the maximum number of times" 
          };
        }
      }

      // For item-specific discounts, check if cart contains specified items
      if (discount.type === "item_specific") {
        if (!discount.specific_items || discount.specific_items.length === 0) {
          return { isValid: false, reason: "No specific items defined for this discount" };
        }

        const cartItemIds = cartItems.map(item => item.menuItem._id.toString());
        const specificItemIds = discount.specific_items.map(id => id.toString());
        
        const hasEligibleItems = cartItemIds.some(itemId => 
          specificItemIds.includes(itemId)
        );

        if (!hasEligibleItems) {
          return { 
            isValid: false, 
            reason: "Cart does not contain items eligible for this discount" 
          };
        }
      }

      return { isValid: true, reason: "Discount is valid" };
    } catch (error) {
      return { isValid: false, reason: "Error validating discount" };
    }
  }

  /**
   * Calculate discount amount based on discount type
   * @param {Object} discount - The discount object
   * @param {Array} cartItems - Array of cart items with populated menuItem and quantity
   * @param {Number} totalBeforeDiscount - Total cart value before discount
   * @returns {Number} - Calculated discount amount
   */
  static calculateDiscountAmount(discount, cartItems, totalBeforeDiscount) {
    let discountAmount = 0;

    switch (discount.type) {
      case "percentage":
        discountAmount = totalBeforeDiscount * (discount.value / 100);
        break;

      case "fixed":
        discountAmount = Math.min(discount.value, totalBeforeDiscount);
        break;

      case "item_specific":
        if (discount.specific_items && discount.specific_items.length > 0) {
          const specificItemIds = discount.specific_items.map(id => id.toString());
          
          cartItems.forEach(cartItem => {
            const itemId = cartItem.menuItem._id.toString();
            if (specificItemIds.includes(itemId)) {
              const itemTotal = cartItem.menuItem.price * cartItem.quantity;
              // Assuming item-specific discounts are percentage-based
              // Could be extended to support fixed amount per item
              discountAmount += itemTotal * (discount.value / 100);
            }
          });
        }
        break;

      default:
        discountAmount = 0;
    }

    // Ensure discount doesn't exceed total
    return Math.min(discountAmount, totalBeforeDiscount);
  }

  /**
   * Get all active discounts available to a customer
   * @param {String} customerId - Customer ID
   * @returns {Array} - Array of available discounts
   */
  static async getAvailableDiscounts(customerId) {
    try {
      const now = new Date();
      
      // Get all active discounts within valid date range
      const discounts = await Discount.find({
        is_active: true,
        valid_from: { $lte: now },
        valid_to: { $gte: now },
        $or: [
          { max_uses: null },
          { $expr: { $lt: ["$current_uses", "$max_uses"] } }
        ]
      }).populate('specific_items');

      // Filter by per-customer usage limits
      const availableDiscounts = [];
      
      for (const discount of discounts) {
        if (discount.max_uses_per_customer !== null) {
          const customerUsage = await Order.countDocuments({
            customer: customerId,
            discount: discount._id
          });
          
          if (customerUsage >= discount.max_uses_per_customer) {
            continue; // Skip this discount
          }
        }
        
        availableDiscounts.push(discount);
      }

      return availableDiscounts;
    } catch (error) {
      throw new Error("Error fetching available discounts");
    }
  }

  /**
   * Apply discount to cart and return updated totals
   * @param {Object} discount - The discount object
   * @param {Array} cartItems - Array of cart items
   * @param {String} customerId - Customer ID
   * @returns {Object} - { isValid, discountAmount, totalAfterDiscount, reason }
   */
  static async applyDiscountToCart(discount, cartItems, customerId) {
    try {
      // Calculate total before discount
      const totalBeforeDiscount = cartItems.reduce((total, item) => {
        return total + (item.menuItem.price * item.quantity);
      }, 0);

      // Validate discount
      const validation = await this.validateDiscount(
        discount, 
        cartItems, 
        customerId, 
        totalBeforeDiscount
      );

      if (!validation.isValid) {
        return {
          isValid: false,
          discountAmount: 0,
          totalAfterDiscount: totalBeforeDiscount,
          reason: validation.reason
        };
      }

      // Calculate discount amount
      const discountAmount = this.calculateDiscountAmount(
        discount, 
        cartItems, 
        totalBeforeDiscount
      );

      const totalAfterDiscount = totalBeforeDiscount - discountAmount;

      return {
        isValid: true,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        totalAfterDiscount: Math.round(totalAfterDiscount * 100) / 100,
        totalBeforeDiscount: Math.round(totalBeforeDiscount * 100) / 100,
        reason: "Discount applied successfully"
      };
    } catch (error) {
      return {
        isValid: false,
        discountAmount: 0,
        totalAfterDiscount: 0,
        reason: "Error applying discount"
      };
    }
  }

  /**
   * Increment discount usage count
   * @param {String} discountId - Discount ID
   */
  static async incrementUsage(discountId) {
    try {
      await Discount.findByIdAndUpdate(
        discountId,
        { $inc: { current_uses: 1 } }
      );
    } catch (error) {
      console.error("Error incrementing discount usage:", error);
    }
  }
}

export default DiscountService;
