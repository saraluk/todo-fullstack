import * as express from "express";
import * as cors from "cors";
import { AppDataSource } from "./data-source";
import todoRoutes from "./api/todos";

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
