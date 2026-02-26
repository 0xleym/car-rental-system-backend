import { describe, it, expect, vi } from "vitest";
import { z } from "zod/v4";
import validate from "../../../src/middleware/validate.js";

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it("should call next() with valid data", () => {
    const req = { body: { name: "John", age: 25 } };
    const res = {};
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "John", age: 25 });
  });

  it("should throw ApiError(400) with invalid data", () => {
    const req = { body: { name: "", age: -1 } };
    const res = {};
    const next = vi.fn();

    expect(() => validate(schema)(req, res, next)).toThrow();
  });

  it("should strip unknown fields from body", () => {
    const req = { body: { name: "John", age: 25, extra: "field" } };
    const res = {};
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(req.body).toEqual({ name: "John", age: 25 });
    expect(req.body.extra).toBeUndefined();
  });
});
