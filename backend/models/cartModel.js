import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
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
    },
  ],
  // Discount information
  appliedDiscount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discount",
    default: null,
  },
  totalBeforeDiscount: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalAfterDiscount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Method to calculate total before discount
cartSchema.methods.calculateTotalBeforeDiscount = function() {
  return this.items.reduce((total, item) => {
    return total + (item.menuItem.price * item.quantity);
  }, 0);
};

// Method to clear discount
cartSchema.methods.clearDiscount = function() {
  this.appliedDiscount = null;
  this.discountAmount = 0;
  this.totalBeforeDiscount = this.calculateTotalBeforeDiscount();
  this.totalAfterDiscount = this.totalBeforeDiscount;
};

// Method to apply discount
cartSchema.methods.applyDiscount = function(discount, discountAmount) {
  this.appliedDiscount = discount._id;
  this.totalBeforeDiscount = this.calculateTotalBeforeDiscount();
  this.discountAmount = discountAmount;
  this.totalAfterDiscount = this.totalBeforeDiscount - discountAmount;
};

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
