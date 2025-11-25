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

// Create the configuration for connecting to the database
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL as string,
  synchronize: true,
  logging: false,
  entities: [Todo, User], // List of database models (entities)
  migrations: [],
  subscribers: [],
  // Railway PostgreSQL connection settings
  extra: {
    ssl: process.env.DATABASE_URL?.includes("railway")
      ? { rejectUnauthorized: false }
      : false,
  },
});
