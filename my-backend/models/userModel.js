const db = require('../config/db');

const User = {
  getAll(callback) {
    db.query(
      `SELECT users.*, roles.name AS role_name
       FROM users
       LEFT JOIN roles ON users.role_id = roles.id`,
      callback
    );
  },

  findById(id, callback) {
    db.query(
      `SELECT users.*, roles.name AS role_name
       FROM users
       LEFT JOIN roles ON users.role_id = roles.id
       WHERE users.id = ?`,
      [id],
      callback
    );
  },

  findByEmail(email, callback) {
    db.query(
      `SELECT users.*, roles.name AS role_name
       FROM users
       LEFT JOIN roles ON users.role_id = roles.id
       WHERE users.email = ?`,
      [email],
      callback
    );
  },

  create(data, callback) {
    db.query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [data.name, data.email, data.password, data.role_id],
      callback
    );
  },

  update(id, data, callback) {
    db.query(
      'UPDATE users SET name = ?, email = ?, password = ?, role_id = ? WHERE id = ?',
      [data.name, data.email, data.password, data.role_id, id],
      callback
    );
  },

  delete(id, callback) {
    db.query('DELETE FROM users WHERE id = ?', [id], callback);
  }
};

module.exports = User;