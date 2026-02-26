import "dotenv/config";
import pool from "./db/db.js";
import { app, errorHandler } from "./app.js";
import apiRoutes from "./routes/index.js";

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
