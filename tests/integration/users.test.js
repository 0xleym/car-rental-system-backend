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

// Mock bcrypt
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$04$hashedpassword"),
    compare: vi.fn(),
  },
}));

import pool from "../../src/db/db.js";

const sampleUser = {
  id: 1,
  username: "testuser",
  role: "user",
  created_at: new Date().toISOString(),
};

describe("User Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return all users (admin only)", async () => {
      const token = generateAdminToken();
      pool.query.mockResolvedValueOnce({
        rows: [sampleUser, { ...sampleUser, id: 2, username: "another" }],
      });

      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toHaveLength(2);
    });

    it("should return 403 for non-admin user", async () => {
      const token = generateToken({ role: "user" });

      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by ID (admin only)", async () => {
      const token = generateAdminToken();
      pool.query.mockResolvedValueOnce({ rows: [sampleUser] });

      const res = await request(app)
        .get("/api/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.username).toBe("testuser");
    });

    it("should return 404 for non-existent user", async () => {
      const token = generateAdminToken();
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get("/api/users/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should allow user to update own profile", async () => {
      const token = generateToken({ userId: 1, role: "user" });
      pool.query
        .mockResolvedValueOnce({ rows: [sampleUser] }) // findById
        .mockResolvedValueOnce({ rows: [{ exists: false }] }) // exists check
        .mockResolvedValueOnce({
          rows: [{ ...sampleUser, username: "newname" }],
        }); // update

      const res = await request(app)
        .patch("/api/users/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "newname" });

      expect(res.status).toBe(200);
    });

    it("should prevent user from updating another user", async () => {
      const token = generateToken({ userId: 1, role: "user" });

      const res = await request(app)
        .patch("/api/users/2")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "hacked" });

      expect(res.status).toBe(403);
    });

    it("should allow admin to update any user", async () => {
      const token = generateAdminToken({ userId: 99 });
      pool.query
        .mockResolvedValueOnce({ rows: [sampleUser] }) // findById
        .mockResolvedValueOnce({ rows: [{ exists: false }] }) // exists check
        .mockResolvedValueOnce({
          rows: [{ ...sampleUser, username: "adminupdated" }],
        }); // update

      const res = await request(app)
        .patch("/api/users/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "adminupdated" });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should allow user to delete own account", async () => {
      const token = generateToken({ userId: 1, role: "user" });
      pool.query
        .mockResolvedValueOnce({ rows: [sampleUser] }) // findById
        .mockResolvedValueOnce({ rowCount: 1 }); // delete

      const res = await request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it("should prevent user from deleting another user", async () => {
      const token = generateToken({ userId: 1, role: "user" });

      const res = await request(app)
        .delete("/api/users/2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
