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
    origin: "*", // Allow all origins for now, change to specific URL in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json());

// --- HEALTHCHECK ENDPOINT (Public, registered early for monitoring) ---
// This needs to be available immediately, even before database connects
app.get("/health", (_req, res) => {
  const dbStatus = AppDataSource.isInitialized ? "connected" : "disconnected";
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
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
  console.log(`Environment variables check:`);
  console.log(
    `- DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`
  );
  console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? "SET" : "NOT SET"}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
});

// Handle server errors
process.on("uncaughtException", (error: Error) => {
  console.error(" Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);
});

// Database initialization with retry logic
async function initializeDatabase(retries = 5, delay = 2000) {
  // Debug: Log all environment variables (without sensitive data)
  console.log("=== Environment Variables Debug ===");
  console.log(
    "All env vars:",
    Object.keys(process.env).filter(
      (key) =>
        key.includes("DATABASE") || key.includes("JWT") || key.includes("NODE")
    )
  );
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    console.error("Please set DATABASE_URL in Railway environment variables.");
    console.error(
      "Current process.env keys:",
      Object.keys(process.env).slice(0, 20)
    );
    return;
  }

  console.log("🔄 Initializing database connection...");
  console.log(`Database URL: ${DATABASE_URL.substring(0, 30)}...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await AppDataSource.initialize();
      console.log("✅ Database connection established successfully.");
      return;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${attempt}/${retries} failed:`,
        error
      );

      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error("❌ Failed to initialize database after all retries.");
        console.error("Error details:", error);
        // Don't exit - server is still running, routes are registered
        // Routes will return 503 errors until database connects
      }
    }
  }
}

initializeDatabase();
