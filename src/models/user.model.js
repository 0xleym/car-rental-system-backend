import pool from "../db/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

class User {
  /**
   * Create a new user with a hashed password.
   */
  static async create(username, password, role = "user") {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const query = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at`;
    const result = await pool.query(query, [
      username.toLowerCase(),
      hashedPassword,
      role,
    ]);
    return result?.rows[0];
  }

  /**
   * Find user by ID (excludes password).
   */
  static async findById(id) {
    const query = `SELECT id, username, role, created_at FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result?.rows[0];
  }

  /**
   * Find user by username (includes password hash for auth verification).
   */
  static async findByUsername(username) {
    const query = `SELECT id, username, password, role, created_at FROM users WHERE username = $1`;
    const result = await pool.query(query, [username.toLowerCase()]);
    return result?.rows[0];
  }

  /**
   * Find all users (excludes password). Admin use.
   */
  static async findAll() {
    const query = `SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result?.rows;
  }

  /**
   * Update user fields. If password is updated, it will be hashed.
   */
  static async update(id, updates) {
    const allowed = ["username", "password"];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (let [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      if (key === "username") value = value.toLowerCase();
      if (key === "password") value = await bcrypt.hash(value, SALT_ROUNDS);

      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(",")} WHERE id = $${paramCount} RETURNING id, username, role, created_at`;
    const result = await pool.query(query, values);
    return result?.rows[0];
  }

  /**
   * Delete a user by ID.
   */
  static async delete(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Check if a username already exists.
   */
  static async exists(username) {
    const query = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`;
    const result = await pool.query(query, [username.toLowerCase()]);
    return result?.rows[0].exists;
  }

  /**
   * Compare a plain-text password against a hashed password.
   */
  static async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  }
}

export default User;
