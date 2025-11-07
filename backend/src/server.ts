import express from "express";
import * as cors from "cors";

import { AppDataSource } from "./data-source";
import todoRoutes from "./api/todos";
import authRoutes from "./authRoutes";
import { authenticateToken } from "./middleware";

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Database initialization and server start function
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");

    // Routes registration
    // --- 1. AUTH ROUTES (Unprotected) ---
    app.use("/auth", authRoutes);
    // --- 2. PROTECT ALL TODO ROUTES ---
    // Middleware runs first, then a check ensures the repository is ready.
    app.use("/api/todos", authenticateToken, (req, res, next) => {
      if (!todoRoutes) {
        return res.status(503).send("Database service unavailable.");
      }
      next();
    });
    app.use("/api/todos", todoRoutes);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
