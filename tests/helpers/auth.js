import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret-for-unit-tests";

/**
 * Generate a valid JWT token for testing.
 */
export function generateToken(payload = {}) {
  const defaults = {
    userId: 1,
    username: "testuser",
    role: "user",
  };
  return jwt.sign({ ...defaults, ...payload }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

/**
 * Generate an admin JWT token for testing.
 */
export function generateAdminToken(payload = {}) {
  return generateToken({ role: "admin", username: "adminuser", ...payload });
}

/**
 * Generate an expired JWT token for testing.
 */
export function generateExpiredToken() {
  return jwt.sign(
    { userId: 1, username: "testuser", role: "user" },
    JWT_SECRET,
    { expiresIn: "0s" }
  );
}

export { JWT_SECRET };
