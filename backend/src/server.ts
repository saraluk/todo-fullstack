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
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);
app.use(express.json());

// --- HEALTHCHECK ENDPOINT (Public, registered early for monitoring) ---
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
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
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);
});

// Database initialization with retry logic
async function initializeDatabase(retries = 5, delay = 2000) {
  const hasDbUrl = !!(
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.RAILWAY_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL
  );

  if (!hasDbUrl) {
    console.error("DATABASE_URL environment variable is not set.");
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await AppDataSource.initialize();
      console.log("Database connection established successfully.");
      return;
    } catch (error) {
      if (attempt < retries) {
        console.log(
          `Database connection attempt ${attempt}/${retries} failed, retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error(
          "Failed to initialize database after all retries:",
          error
        );
        // Don't exit - server is still running, routes are registered
        // Routes will return 503 errors until database connects
      }
    }
  }
}

initializeDatabase();
