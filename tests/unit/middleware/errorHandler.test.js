import { describe, it, expect, vi } from "vitest";
import errorHandler from "../../../src/middleware/errorHandler.js";
import { ApiError } from "../../../src/utils/ApiError.js";
import logger from "../../../src/utils/logger.js";

describe("errorHandler middleware", () => {
  function createMockRes() {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    return res;
  }

  it("should return structured JSON for ApiError instances", () => {
    const err = new ApiError(400, "Bad request");
    const req = {};
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Bad request",
    });
  });

  it("should include validation errors when present", () => {
    const errors = [{ field: "email", message: "Invalid" }];
    const err = new ApiError(400, "Validation failed", errors);
    const req = {};
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Validation failed",
      errors,
    });
  });

  it("should return 500 for non-ApiError errors", () => {
    const err = new Error("something broke");
    const req = { method: "GET", originalUrl: "/test" };
    const res = createMockRes();
    const next = vi.fn();

    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error",
    });

    logSpy.mockRestore();
  });

  it("should log unhandled errors via logger", () => {
    const err = new Error("unhandled");
    const req = { method: "POST", originalUrl: "/api/test" };
    const res = createMockRes();
    const next = vi.fn();
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(logSpy).toHaveBeenCalledWith(
      { err, method: "POST", url: "/api/test" },
      "Unhandled error"
    );
    logSpy.mockRestore();
  });
});
