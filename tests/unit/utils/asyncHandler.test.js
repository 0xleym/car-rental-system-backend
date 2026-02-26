import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../../../src/utils/asyncHandler.js";

describe("asyncHandler", () => {
  it("should call the handler and pass req, res, next", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);
    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it("should call next with error if handler throws", async () => {
    const error = new Error("test error");
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should not call next with error if handler succeeds", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });
});
