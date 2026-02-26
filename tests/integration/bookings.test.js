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
};

const sampleBooking = {
  id: 1,
  user_id: 1,
  car_id: 1,
  car_name: "Camry",
  days: 3,
  rent_per_day: "50.00",
  status: "booked",
  created_at: new Date().toISOString(),
  car_name_current: "Camry",
  car_brand: "Toyota",
};

describe("Booking Endpoints", () => {
  let userToken;

  beforeEach(() => {
    vi.clearAllMocks();
    userToken = generateToken({ userId: 1 });
  });

  describe("POST /api/bookings", () => {
    it("should create a booking for available car", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [sampleCar] }) // Car.findById
        .mockResolvedValueOnce({ rows: [sampleBooking] }) // Booking.create
        .mockResolvedValueOnce({ rows: [{ ...sampleCar, available: false }] }); // Car.setAvailability

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ car_id: 1, days: 3 });

      expect(res.status).toBe(201);
      expect(res.body.data.booking.car_name).toBe("Camry");
      expect(res.body.data.total_cost).toBe(150);
    });

    it("should return 404 if car does not exist", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ car_id: 999, days: 3 });

      expect(res.status).toBe(404);
    });

    it("should return 409 if car is not available", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ ...sampleCar, available: false }],
      });

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ car_id: 1, days: 3 });

      expect(res.status).toBe(409);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({ car_id: 1, days: 3 });

      expect(res.status).toBe(401);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ car_id: "abc", days: -1 });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/bookings", () => {
    it("should return user's bookings", async () => {
      pool.query.mockResolvedValueOnce({ rows: [sampleBooking] });

      const res = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toHaveLength(1);
    });

    it("should return all bookings for admin", async () => {
      const adminToken = generateAdminToken();
      pool.query.mockResolvedValueOnce({
        rows: [sampleBooking, { ...sampleBooking, id: 2, user_id: 2 }],
      });

      const res = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toHaveLength(2);
    });
  });

  describe("GET /api/bookings/summary", () => {
    it("should return booking summary for user", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ total_bookings: "2", total_amount_spent: "300.00" }],
      });

      const res = await request(app)
        .get("/api/bookings/summary")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.total_bookings).toBe("2");
    });
  });

  describe("GET /api/bookings/:id", () => {
    it("should return a specific booking for the owner", async () => {
      pool.query.mockResolvedValueOnce({ rows: [sampleBooking] });

      const res = await request(app)
        .get("/api/bookings/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.booking.id).toBe(1);
    });

    it("should return 404 if booking not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get("/api/bookings/999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/bookings/:id", () => {
    it("should cancel a booking and make car available", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [sampleBooking] }) // findByUserIdAndBookingId
        .mockResolvedValueOnce({
          rows: [{ ...sampleBooking, status: "cancelled" }],
        }) // update
        .mockResolvedValueOnce({ rows: [{ ...sampleCar, available: true }] }); // setAvailability

      const res = await request(app)
        .patch("/api/bookings/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "cancelled" });

      expect(res.status).toBe(200);
      expect(res.body.data.booking.status).toBe("cancelled");
    });

    it("should not update an already cancelled booking", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ ...sampleBooking, status: "cancelled" }],
      });

      const res = await request(app)
        .patch("/api/bookings/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "completed" });

      expect(res.status).toBe(400);
    });

    it("should reject invalid status values", async () => {
      const res = await request(app)
        .patch("/api/bookings/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "invalid_status" });

      expect(res.status).toBe(400);
    });
  });
});
