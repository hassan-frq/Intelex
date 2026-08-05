// Run with: npm run migrate
// Applies schema.sql to the database configured via DATABASE_URL.
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sql from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "../db/schema.sql");

async function migrate() {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await sql.unsafe(schema);
  console.log("Schema applied successfully.");
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());