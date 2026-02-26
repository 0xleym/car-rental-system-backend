import { vi } from "vitest";

/**
 * Set up test environment variables before any modules load.
 */
process.env.JWT_SECRET = "test-secret-for-unit-tests";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BCRYPT_SALT_ROUNDS = "4"; // Low rounds for fast tests
process.env.CORS_ORIGIN = "*";
process.env.PORT = "0"; // Random port for tests

/**
 * Create a mock pool that can be used to stub database calls.
 */
export function createMockPool() {
  return {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
  };
}
