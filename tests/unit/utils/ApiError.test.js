import { describe, it, expect } from "vitest";
import { ApiError } from "../../../src/utils/ApiError.js";

describe("ApiError", () => {
  it("should create an error with statusCode and message", () => {
    const error = new ApiError(400, "Bad request");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad request");
    expect(error.success).toBe(false);
    expect(error.errors).toEqual([]);
  });

  it("should use default message when none provided", () => {
    const error = new ApiError(500);
    expect(error.message).toBe("Something went wrong");
  });

  it("should store additional errors array", () => {
    const errors = [{ field: "email", message: "Invalid" }];
    const error = new ApiError(422, "Validation failed", errors);
    expect(error.errors).toEqual(errors);
  });

  it("should have a stack trace", () => {
    const error = new ApiError(500, "Server error");
    expect(error.stack).toBeDefined();
    expect(error.stack.length).toBeGreaterThan(0);
  });

  it("should use provided stack when given", () => {
    const customStack = "custom stack trace";
    const error = new ApiError(500, "Error", [], customStack);
    expect(error.stack).toBe(customStack);
  });

  it("should set data to null", () => {
    const error = new ApiError(400, "Bad request");
    expect(error.data).toBeNull();
  });
});
