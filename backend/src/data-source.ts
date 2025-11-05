// data source and all connection configuration

import "reflect-metadata";
import { DataSource } from "typeorm";
import { Todo } from "./entity/Todo";
import * as dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Create the configuration for connecting to the database
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL as string,
  synchronize: true,
  logging: false,
  entities: [Todo], // List of database models (entities)
  migrations: [],
  subscribers: [],
});
