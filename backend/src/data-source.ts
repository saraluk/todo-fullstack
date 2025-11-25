// data source and all connection configuration

import * as dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";

import { Todo } from "./entity/Todo";
import { User } from "./entity/User";

// Load environment variables from .env (only in development)
// In production (Railway), environment variables are set directly
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Select the best available database URL
// Priority: Private URL (no fees) > Public URL (works) > Standard DATABASE_URL
const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_PRIVATE_URL || // Private endpoint (no fees, preferred)
    process.env.DATABASE_PUBLIC_URL || // Public endpoint (works, has fees)
    process.env.RAILWAY_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    ""
  );
};

const databaseUrl = getDatabaseUrl();

// Create the configuration for connecting to the database
export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  synchronize: true,
  logging: false,
  entities: [Todo, User], // List of database models (entities)
  migrations: [],
  subscribers: [],
  // Railway PostgreSQL connection settings
  extra: {
    ssl:
      databaseUrl.includes("railway") || databaseUrl.includes("proxy.railway")
        ? { rejectUnauthorized: false }
        : false,
  },
});
