"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrator_1 = require("drizzle-orm/neon-serverless/migrator");
const index_js_1 = require("./index.js");
require("dotenv/config");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Running migrations...");
            yield (0, migrator_1.migrate)(index_js_1.db, { migrationsFolder: "./drizzle" });
            console.log("Migrations applied successfully!");
            process.exit(0);
        }
        catch (e) {
            console.error("Migration failed:", e);
            process.exit(1);
        }
    });
}
main();
