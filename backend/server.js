import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import adminMenuRoutes from "./routes/adminMenuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// health check endpoint
app.get("/", (_req, res) => res.send("Coffee Shop API"));

// authentication routes
app.use("/api/auth", authRoutes);

// public menu routes
app.use("/menu", menuRoutes);

// admin menu routes
app.use("/admin/menu", adminMenuRoutes);

// cart routes
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
