import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../helpers/app.js";
import { generateToken } from "../helpers/auth.js";

// Mock the database pool
vi.mock("../../src/db/db.js", () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
  },
}));

// Mock bcrypt for speed
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$04$hashedpassword"),
    compare: vi.fn(),
  },
}));

import pool from "../../src/db/db.js";
import bcrypt from "bcrypt";

describe("Auth Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      // User doesn't exist yet
      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: false }] }) // exists check
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              username: "newuser",
              role: "user",
              created_at: new Date().toISOString(),
            },
          ],
        }); // insert

      const res = await request(app).post("/api/auth/register").send({
        username: "newuser",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe("newuser");
      expect(res.body.data.token).toBeDefined();
    });

    it("should return 409 if username already taken", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] });

      const res = await request(app).post("/api/auth/register").send({
        username: "existinguser",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "ab", // too short (min 3)
        password: "short", // too short (min 8)
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            password: "$2b$04$hashedpassword",
            role: "user",
            created_at: new Date().toISOString(),
          },
        ],
      });
      bcrypt.compare.mockResolvedValueOnce(true);

      const res = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should return 401 for non-existent user", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "password123",
      });

      expect(res.status).toBe(401);
    });

    it("should return 401 for wrong password", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            password: "$2b$04$hashedpassword",
            role: "user",
          },
        ],
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      const res = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile", async () => {
      const token = generateToken({ userId: 1, username: "testuser" });

      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            role: "user",
            created_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.username).toBe("testuser");
    });

    it("should return 401 without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});
