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
// CORS - allows all origins by default, or specific frontend URL if set
const corsOptions = process.env.FRONTEND_URL
  ? {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  : {
      origin: true, // Allow all origins
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

// Apply CORS middleware - must be before routes
app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly (backup in case CORS middleware doesn't catch it)
app.options("*", cors(corsOptions));

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
  console.log(`✅ Server is running on port ${PORT}.`);
  console.log(`✅ Healthcheck available at: http://localhost:${PORT}/health`);
  console.log(`✅ Routes registered: /api/auth, /api/todos`);
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
