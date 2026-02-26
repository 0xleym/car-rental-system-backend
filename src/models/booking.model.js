import pool from "../db/db.js";

class Booking {
  /**
   * Create a booking.
   */
  static async create({
    user_id,
    car_id,
    car_name,
    days,
    rent_per_day,
    status = "booked",
  }) {
    const query = `INSERT INTO bookings (user_id, car_id, car_name, days, rent_per_day, status) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const result = await pool.query(query, [
      user_id,
      car_id,
      car_name,
      days,
      rent_per_day,
      status,
    ]);
    return result?.rows[0];
  }

  /**
   * Find all bookings for a user (with car details).
   */
  static async findByUserId(user_id) {
    const query = `SELECT b.*, c.name AS car_name_current, c.brand AS car_brand
                   FROM bookings b
                   LEFT JOIN cars c ON b.car_id = c.id
                   WHERE b.user_id = $1 
                   ORDER BY b.created_at DESC`;
    const result = await pool.query(query, [user_id]);
    return result?.rows;
  }

  /**
   * Find all bookings (admin). With car and user details.
   */
  static async findAll() {
    const query = `SELECT b.*, c.name AS car_name_current, c.brand AS car_brand, u.username
                   FROM bookings b
                   LEFT JOIN cars c ON b.car_id = c.id
                   LEFT JOIN users u ON b.user_id = u.id
                   ORDER BY b.created_at DESC`;
    const result = await pool.query(query);
    return result?.rows;
  }

  /**
   * Find a booking by its ID.
   */
  static async findByBookingId(id) {
    const query = `SELECT b.*, c.name AS car_name_current, c.brand AS car_brand
                   FROM bookings b
                   LEFT JOIN cars c ON b.car_id = c.id
                   WHERE b.id = $1`;
    const result = await pool.query(query, [id]);
    return result?.rows[0];
  }

  /**
   * Find a booking scoped to a specific user.
   */
  static async findByUserIdAndBookingId(user_id, id) {
    const query = `SELECT b.*, c.name AS car_name_current, c.brand AS car_brand
                   FROM bookings b
                   LEFT JOIN cars c ON b.car_id = c.id
                   WHERE b.id = $1 AND b.user_id = $2`;
    const result = await pool.query(query, [id, user_id]);
    return result?.rows[0];
  }

  /**
   * Update booking fields (with whitelist).
   */
  static async update(id, updates) {
    const allowed = ["status"];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);
    const query = `UPDATE bookings SET ${fields.join(",")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result?.rows[0];
  }

  /**
   * Get booking summary stats for a user.
   */
  static async getSummary(user_id) {
    const query = `SELECT 
                        COUNT(*) as total_bookings,
                        COALESCE(SUM(days * rent_per_day), 0) as total_amount_spent
                   FROM bookings 
                   WHERE user_id = $1 
                   AND status IN ('booked', 'completed')`;
    const result = await pool.query(query, [user_id]);
    return result?.rows[0];
  }

  /**
   * Calculate total cost for a booking.
   */
  static calculateTotalCost(days, rent_per_day) {
    return days * rent_per_day;
  }
}

export default Booking;
