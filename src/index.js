import "dotenv/config";
import pool from "./db/db.js";
import { app, errorHandler } from "./app.js";
import apiRoutes from "./routes/index.js";
import logger from "./utils/logger.js";

const port = process.env.PORT || 5001;

// Health check
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.json({ status: "ok", database: result.rows[0].current_database });
});

// API routes
app.use("/api", apiRoutes);

// Error handler must be the last middleware
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    logger.info("Server closed. Database pool ended.");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
