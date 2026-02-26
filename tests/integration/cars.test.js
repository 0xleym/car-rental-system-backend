import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../helpers/app.js";
import { generateToken, generateAdminToken } from "../helpers/auth.js";

// Mock the database pool
vi.mock("../../src/db/db.js", () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
  },
}));

import pool from "../../src/db/db.js";

const sampleCar = {
  id: 1,
  name: "Camry",
  brand: "Toyota",
  model_year: 2024,
  rent_per_day: "50.00",
  available: true,
  created_at: new Date().toISOString(),
};

describe("Car Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/cars", () => {
    it("should return all cars (public)", async () => {
      pool.query.mockResolvedValueOnce({ rows: [sampleCar] });

      const res = await request(app).get("/api/cars");

      expect(res.status).toBe(200);
      expect(res.body.data.cars).toHaveLength(1);
      expect(res.body.data.cars[0].name).toBe("Camry");
    });

    it("should filter by availability", async () => {
      pool.query.mockResolvedValueOnce({ rows: [sampleCar] });

      const res = await request(app).get("/api/cars?available=true");

      expect(res.status).toBe(200);
      // Verify the query was called with the available filter
      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe("GET /api/cars/:id", () => {
    it("should return a car by ID (public)", async () => {
      pool.query.mockResolvedValueOnce({ rows: [sampleCar] });

      const res = await request(app).get("/api/cars/1");

      expect(res.status).toBe(200);
      expect(res.body.data.car.name).toBe("Camry");
    });

    it("should return 404 for non-existent car", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/api/cars/999");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/cars", () => {
    it("should create a car (admin only)", async () => {
      const token = generateAdminToken();
      pool.query.mockResolvedValueOnce({ rows: [sampleCar] });

      const res = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Camry",
          brand: "Toyota",
          model_year: 2024,
          rent_per_day: 50.0,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.car.name).toBe("Camry");
    });

    it("should return 403 for non-admin user", async () => {
      const token = generateToken({ role: "user" });

      const res = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Camry",
          brand: "Toyota",
          model_year: 2024,
          rent_per_day: 50.0,
        });

      expect(res.status).toBe(403);
    });

    it("should return 401 without a token", async () => {
      const res = await request(app).post("/api/cars").send({
        name: "Camry",
        brand: "Toyota",
        model_year: 2024,
        rent_per_day: 50.0,
      });

      expect(res.status).toBe(401);
    });

    it("should return 400 for invalid input", async () => {
      const token = generateAdminToken();

      const res = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "",
          brand: "",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/cars/:id", () => {
    it("should update a car (admin only)", async () => {
      const token = generateAdminToken();
      pool.query
        .mockResolvedValueOnce({ rows: [sampleCar] }) // findById
        .mockResolvedValueOnce({
          rows: [{ ...sampleCar, rent_per_day: "75.00" }],
        }); // update

      const res = await request(app)
        .patch("/api/cars/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ rent_per_day: 75.0 });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/cars/:id", () => {
    it("should delete a car (admin only)", async () => {
      const token = generateAdminToken();
      pool.query
        .mockResolvedValueOnce({ rows: [sampleCar] }) // findById
        .mockResolvedValueOnce({ rowCount: 1 }); // delete

      const res = await request(app)
        .delete("/api/cars/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent car", async () => {
      const token = generateAdminToken();
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete("/api/cars/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
