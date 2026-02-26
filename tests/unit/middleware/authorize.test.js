import { describe, it, expect, vi } from "vitest";
import authorize from "../../../src/middleware/authorize.js";

describe("authorize middleware", () => {
  it("should throw 401 if req.user is not set", () => {
    const req = {};
    const res = {};
    const next = vi.fn();

    expect(() => authorize("admin")(req, res, next)).toThrow();
  });

  it("should throw 403 if user role is not in allowed roles", () => {
    const req = { user: { userId: 1, role: "user" } };
    const res = {};
    const next = vi.fn();

    expect(() => authorize("admin")(req, res, next)).toThrow();
  });

  it("should call next() if user role is in allowed roles", () => {
    const req = { user: { userId: 1, role: "admin" } };
    const res = {};
    const next = vi.fn();

    authorize("admin")(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should accept multiple allowed roles", () => {
    const req = { user: { userId: 1, role: "user" } };
    const res = {};
    const next = vi.fn();

    authorize("admin", "user")(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
