import express from "express";
import cors from "cors";

import { AppDataSource } from "./data-source";
import todoRoutes from "./api/todos";
import authRoutes from "./authRoutes";
import { authenticateToken } from "./middleware";

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware setup
// CORS - allows all origins in development, or specific frontend URL in production
const corsOptions = process.env.FRONTEND_URL
  ? {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  : {
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
app.use(cors(corsOptions));
app.use(express.json());

// --- HEALTHCHECK ENDPOINT (Public, registered early for monitoring) ---
// This needs to be available immediately, even before database connects
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start Express server immediately (before database connection)
// This allows healthchecks to pass while database is connecting
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Database initialization and route registration
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");

    // Routes registration (after database is connected)
    // --- 1. AUTH ROUTES (Unprotected) ---
    app.use("/api/auth", authRoutes);
    // --- 2. PROTECT ALL TODO ROUTES ---
    // authenticateToken middleware runs first, then todoRoutes handles the actual routes
    app.use("/api/todos", authenticateToken, todoRoutes);

    console.log("All routes registered successfully.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Don't exit - server is still running, healthcheck will still work
    // But API routes won't function until database connects
  }
}

startServer();
