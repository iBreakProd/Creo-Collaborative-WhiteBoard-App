import "dotenv/config";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
export * from "./schema.js";
declare let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;
export { db };
