import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  total_before_discount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discount",
    default: null,
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total_after_discount: {
    type: Number,
    required: true,
    min: 0,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "completed", "canceled"],
    default: "pending",
  },
}, {
  timestamps: true
});

// Index for efficient queries
orderSchema.index({ customer: 1, order_date: -1 });
orderSchema.index({ discount: 1 });
orderSchema.index({ status: 1 });

// Virtual to calculate savings
orderSchema.virtual('savings').get(function() {
  return this.total_before_discount - this.total_after_discount;
});

// Method to validate discount totals
orderSchema.methods.validateTotals = function() {
  return this.total_after_discount === (this.total_before_discount - this.discount_amount);
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
