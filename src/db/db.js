import pkg from "pg";
import logger from "../utils/logger.js";

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on("connect", () => {
  logger.info("Database connection pool established");
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected database pool error");
});

export default pool;
