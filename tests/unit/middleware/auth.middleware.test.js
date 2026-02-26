import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../helpers/auth.js";

// Set env before importing middleware
process.env.JWT_SECRET = JWT_SECRET;

import authMiddleware from "../../../src/middleware/auth.middleware.js";

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it("should throw 401 if no Authorization header", async () => {
    await authMiddleware(req, res, next);

    // asyncHandler catches and forwards to next
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Authorization header missing");
  });

  it("should throw 401 if token format is invalid", async () => {
    req.headers.authorization = "InvalidFormat";
    await authMiddleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
  });

  it("should throw 401 if token is invalid", async () => {
    req.headers.authorization = "Bearer invalid.token.here";
    await authMiddleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Token invalid");
  });

  it("should set req.user and call next() with valid token", async () => {
    const payload = { userId: 1, username: "testuser", role: "user" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    req.headers.authorization = `Bearer ${token}`;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.username).toBe("testuser");
    expect(req.user.role).toBe("user");
  });
});
