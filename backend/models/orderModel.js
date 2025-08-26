import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
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
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
