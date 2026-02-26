import { describe, it, expect, vi } from "vitest";
import errorHandler from "../../../src/middleware/errorHandler.js";
import { ApiError } from "../../../src/utils/ApiError.js";

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

  it("should return 500 for non-ApiError errors", () => {
    const err = new Error("something broke");
    const req = {};
    const res = createMockRes();
    const next = vi.fn();

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error",
    });

    consoleSpy.mockRestore();
  });

  it("should log unhandled errors to console", () => {
    const err = new Error("unhandled");
    const req = {};
    const res = createMockRes();
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith("Unhandled error:", err);
    consoleSpy.mockRestore();
  });
});
