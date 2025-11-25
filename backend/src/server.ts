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
// CORS - simple configuration that definitely works
// Allow all origins for now (can restrict with FRONTEND_URL env var later)
app.use(
  cors({
    origin: "*", // Allow all origins - change to specific URL in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // Set to false when using origin: "*"
  })
);

// Log CORS configuration on startup
console.log(`CORS configured - allowing all origins`);

app.use(express.json());

// --- HEALTHCHECK ENDPOINT (Public, registered early for monitoring) ---
// This needs to be available immediately, even before database connects
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register routes immediately (before database connection)
// Routes will handle database errors gracefully
// --- 1. AUTH ROUTES (Unprotected) ---
app.use("/api/auth", authRoutes);
// --- 2. PROTECT ALL TODO ROUTES ---
// authenticateToken middleware runs first, then todoRoutes handles the actual routes
app.use("/api/todos", authenticateToken, todoRoutes);

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Handle server errors
process.on("uncaughtException", (error: Error) => {
  console.error(" Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);
});

// Database initialization (happens in background)
async function initializeDatabase() {
  try {
    console.log("Initializing database connection...");
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Don't exit - server is still running, routes are registered
    // Routes will return 500 errors until database connects
  }
}

initializeDatabase();
