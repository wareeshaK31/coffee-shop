import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

// DB connect
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple route (test)
app.get("/", (req, res) => {
  res.send("Coffee Shop API is running...");
});

// Custom logging (instead of morgan)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
