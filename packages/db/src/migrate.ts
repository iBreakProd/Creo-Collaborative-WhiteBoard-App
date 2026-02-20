import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { db } from "./index.js";
import 'dotenv/config';

async function main() {
    try {
        console.log("Running migrations...");
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migrations applied successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

main();
