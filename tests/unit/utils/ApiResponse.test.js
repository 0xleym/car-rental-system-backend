import { describe, it, expect } from "vitest";
import { ApiResponse } from "../../../src/utils/ApiResponse.js";

describe("ApiResponse", () => {
  it("should create a successful response", () => {
    const data = { id: 1, name: "test" };
    const response = new ApiResponse(200, data, "OK");
    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual(data);
    expect(response.message).toBe("OK");
    expect(response.success).toBe(true);
  });

  it("should default message to 'Success'", () => {
    const response = new ApiResponse(200, null);
    expect(response.message).toBe("Success");
  });

  it("should set success=true for status codes < 400", () => {
    expect(new ApiResponse(200, null).success).toBe(true);
    expect(new ApiResponse(201, null).success).toBe(true);
    expect(new ApiResponse(299, null).success).toBe(true);
    expect(new ApiResponse(399, null).success).toBe(true);
  });

  it("should set success=false for status codes >= 400", () => {
    expect(new ApiResponse(400, null).success).toBe(false);
    expect(new ApiResponse(404, null).success).toBe(false);
    expect(new ApiResponse(500, null).success).toBe(false);
  });
});
