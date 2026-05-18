const db = require('../config/db');

const ProductType = {
  getAll(callback) {
    db.query('SELECT * FROM product_types', callback);
  },

  findById(id, callback) {
    db.query('SELECT * FROM product_types WHERE id = ?', [id], callback);
  },

  create(data, callback) {
    db.query(
      'INSERT INTO product_types (name, description) VALUES (?, ?)',
      [data.name, data.description],
      callback
    );
  },

  update(id, data, callback) {
    db.query(
      'UPDATE product_types SET name = ?, description = ? WHERE id = ?',
      [data.name, data.description, id],
      callback
    );
  },

  delete(id, callback) {
    db.query('DELETE FROM product_types WHERE id = ?', [id], callback);
  }
};

module.exports = ProductType;