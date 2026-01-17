import pool from "../db/db.js";

class User {
  // create
  static async create(username, password) {
    const query = `INSERT INTO users (username, password) values ($1, $2) RETURNING id, username, created_at`;

    const result = pool.query(query, [username.toLowerCase(), password]);
    return result?.rows[0];
  }

  // find user by id
  static async findById(id) {
    const query = `SELECT id, username, created_at FROM users WHERE id=$1`;
    const result = pool.query(query, [id]);
    return result?.rows[0];
  }

  // update user
  static async update(id, updates) {
    const allowed = [username, password];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (let [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      if (key === "username") value = value.toLowerCase();

      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(",")} WHERE id = $${paramCount}`;
    const result = pool.query(query, values);
    return result?.rows[0];
  }

  // delete user
  static async delete(id) {
    const query = `DELETE from users WHERE id = $1`;
    const result = pool.query(query, [id]);
    return result?.rows[0];
  }

  //does user already exist
  static async exists(username) {
    const query = `SELECT EXISTS(SELECT 1 from users WHERE username = $1)`;
    const result = pool.query(query, [username.toLowerCase()]);
    return result?.rows[0].exists;
  }
}

export default User;
