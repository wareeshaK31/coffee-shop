import mongoose from "mongoose";

const categories = ["Coffee", "Pastry", "Drink", "Other"];

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 255 },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: categories }
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
