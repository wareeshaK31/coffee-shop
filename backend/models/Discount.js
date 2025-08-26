import mongoose from "mongoose";

const discountTypes = ["percentage", "fixed", "item_specific"];

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Discount name is required"],
      maxlength: 255,
    },
    code: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when present
      maxlength: 50,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: [true, "Discount type is required"],
      enum: discountTypes,
    },
    value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value must be positive"],
    },
    min_order_value: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value must be positive"],
    },
    valid_from: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    valid_to: {
      type: Date,
      required: [true, "Valid to date is required"],
    },
    max_uses: {
      type: Number,
      default: null, // null means unlimited
      min: [1, "Max uses must be at least 1"],
    },
    max_uses_per_customer: {
      type: Number,
      default: null, // null means unlimited
      min: [1, "Max uses per customer must be at least 1"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    // For item-specific discounts - references to MenuItem
    specific_items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
    }],
    // Track current usage
    current_uses: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
    // Add validation for date range
    validate: {
      validator: function() {
        return this.valid_from < this.valid_to;
      },
      message: "Valid from date must be before valid to date"
    }
  }
);

// Index for efficient queries
discountSchema.index({ is_active: 1, valid_from: 1, valid_to: 1 });
discountSchema.index({ type: 1 });
discountSchema.index({ code: 1 });

// Virtual to check if discount is currently valid (excluding usage limits)
discountSchema.virtual('is_currently_valid').get(function() {
  const now = new Date();
  return this.is_active && 
         this.valid_from <= now && 
         this.valid_to >= now;
});

// Method to check if discount has usage remaining
discountSchema.methods.hasUsageRemaining = function() {
  if (this.max_uses === null) return true;
  return this.current_uses < this.max_uses;
};

// Method to check usage per customer (requires separate query)
discountSchema.methods.canBeUsedByCustomer = async function(customerId) {
  if (this.max_uses_per_customer === null) return true;
  
  // This will be implemented when we have Order model with discount reference
  const Order = mongoose.model('Order');
  const customerUsage = await Order.countDocuments({
    customer: customerId,
    discount: this._id
  });
  
  return customerUsage < this.max_uses_per_customer;
};

const Discount = mongoose.model("Discount", discountSchema);

export default Discount;
