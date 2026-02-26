/* eslint-disable no-console */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  const client = await pool.connect();

  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get already applied migrations
    const { rows: applied } = await client.query(
      `SELECT name FROM _migrations ORDER BY name`
    );
    const appliedSet = new Set(applied.map((r) => r.name));

    // Read migration files
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let appliedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  Skipping (already applied): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(`INSERT INTO _migrations (name) VALUES ($1)`, [
          file,
        ]);
        await client.query("COMMIT");
        console.log(`  Applied: ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  Failed: ${file}`);
        console.error(`  Error: ${err.message}`);
        throw err;
      }
    }

    if (appliedCount === 0) {
      console.log("  All migrations are up to date.");
    } else {
      console.log(`  ${appliedCount} migration(s) applied successfully.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

console.log("Running migrations...");
migrate()
  .then(() => {
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
