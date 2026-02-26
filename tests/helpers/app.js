/**
 * Creates a test-ready Express app with all routes and middleware,
 * but WITHOUT starting a server or connecting to a real database.
 *
 * For integration tests, we mock the database pool at the model level.
 */
import "../../tests/helpers/setup.js";
import { app, errorHandler } from "../../src/app.js";
import apiRoutes from "../../src/routes/index.js";

// Mount API routes
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
