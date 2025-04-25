import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { taskRoutes } from "./routes/taskRoutes.js";

const app = express();
const PORT = 3001;

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://singhjappanjot1:cUK7vHWXDobYJcRr@cluster0.wyqyo.mongodb.net/monthlyPlanner"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
