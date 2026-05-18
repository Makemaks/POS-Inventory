const db = require('../config/db');

const Role = {
  create(role, callback) {
    db.query(
      'INSERT INTO roles (name) VALUES (?)',
      [role.name],
      callback
    );
  },

  getAll(callback) {
    db.query('SELECT * FROM roles', callback);
  },

  findById(id, callback) {
    db.query('SELECT * FROM roles WHERE id = ?', [id], callback);
  },

  findByName(name, callback) {
    db.query('SELECT * FROM roles WHERE name = ?', [name], callback);
  },
};

module.exports = Role;