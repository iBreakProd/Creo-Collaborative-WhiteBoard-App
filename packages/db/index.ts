
import "dotenv/config";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as PoolPg } from "pg";
import { Pool as PoolNeon } from "@neondatabase/serverless";
import * as schema from "./src/schema";

// Export schema for usage in apps
export * from "./src/schema";

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>; // Simplification, types are slightly different but usable

const env = process.env.NODE_ENV;

if (env && env === "production") {
  const sql = new PoolNeon({ connectionString: process.env.DATABASE_URL! });
  db = drizzleNeon(sql, { schema });
} else {
  const pool = new PoolPg({ connectionString: process.env.DATABASE_URL! });
  db = drizzlePg(pool, { schema });
}

export { db };
