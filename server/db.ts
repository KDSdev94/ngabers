import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Only initialize if URL is provided
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString ? new Pool({ connectionString }) : null;
export const db = pool ? drizzle(pool, { schema }) : null;

if (!connectionString) {
  console.log("[Database] DATABASE_URL is not set, database features will be disabled.");
}
