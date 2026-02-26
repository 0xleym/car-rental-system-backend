import pool from "../db/db.js";

class Car {
  /**
   * Create a new car.
   */
  static async create({ name, brand, model_year, rent_per_day }) {
    const query = `INSERT INTO cars (name, brand, model_year, rent_per_day) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await pool.query(query, [
      name,
      brand,
      model_year,
      rent_per_day,
    ]);
    return result?.rows[0];
  }

  /**
   * Find a car by ID.
   */
  static async findById(id) {
    const query = `SELECT * FROM cars WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result?.rows[0];
  }

  /**
   * Find all cars with optional filters (available, brand).
   */
  static async findAll({ available, brand } = {}) {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (available !== undefined) {
      conditions.push(`available = $${paramCount++}`);
      values.push(available);
    }

    if (brand) {
      conditions.push(`LOWER(brand) = $${paramCount}`);
      values.push(brand.toLowerCase());
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT * FROM cars ${where} ORDER BY created_at DESC`;
    const result = await pool.query(query, values);
    return result?.rows;
  }

  /**
   * Update car fields.
   */
  static async update(id, updates) {
    const allowed = [
      "name",
      "brand",
      "model_year",
      "rent_per_day",
      "available",
    ];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    const query = `UPDATE cars SET ${fields.join(",")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result?.rows[0];
  }

  /**
   * Delete a car by ID.
   * @returns {boolean} True if a row was deleted
   */
  static async delete(id) {
    const query = `DELETE FROM cars WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Set car availability.
   */
  static async setAvailability(id, available) {
    const query = `UPDATE cars SET available = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [available, id]);
    return result?.rows[0];
  }
}

export default Car;
