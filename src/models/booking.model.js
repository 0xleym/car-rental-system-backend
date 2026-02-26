import pool from "../db/db.js";

class Booking {
  // create a booking
  static async create({
    user_id,
    car_name,
    days,
    rent_per_day,
    status = "booked",
  }) {
    const query = `INSERT INTO bookings (user_id, car_name, days, rent_per_day, status) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const result = await pool.query(query, [
      user_id,
      car_name,
      days,
      rent_per_day,
      status,
    ]);
    return result?.rows[0];
  }
  // find all bookings of a user
  static async findByUserId(user_id) {
    const query = `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [user_id]);
    return result?.rows;
  }

  // find a booking based on id
  static async findByBookingId(id) {
    const query = ` SELECT * FROM bookings WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // find a booking based on user_id and id
  static async findByUserIdAndBookingId(user_id, id) {
    const query = `SELECT * FROM bookings WHERE id = $1 AND user_id=$2`;
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
  }
  // update booking
  static async update(id, updates) {
    const allowed = ["car_name", "days", "rent_per_day", "status"];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (let [key, value] of Object.entries(updates)) {
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

  // summary
  static async getSummary(user_id) {
    const query = `SELECT 
                        COUNT(*) as total_bookings,
                        COALESCE(SUM(days * rent_per_day), 0) as total_amount_spent
                   FROM bookings 
                   WHERE user_id = $1 
                   AND status IN ('booked', 'completed')`;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  static calculateTotalCost(days, rent_per_day) {
    return days * rent_per_day;
  }
}

export default Booking;
