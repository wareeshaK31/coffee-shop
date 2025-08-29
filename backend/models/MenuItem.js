import mongoose from "mongoose";

const categories = ["Coffee", "Tea", "Pastry", "Sandwich", "Dessert", "Drink", "Other"];

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 255 },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: categories },
    image: { type: String, default: "" },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
