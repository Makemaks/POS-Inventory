const db = require('../config/db');

const Product = {
  getAll(callback) {
    db.query(
      `SELECT products.*, product_types.name AS type_name
       FROM products
       LEFT JOIN product_types ON products.type_id = product_types.id`,
      callback
    );
  },

  findById(id, callback) {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
  },

  create(data, callback) {
    db.query(
      `INSERT INTO products 
      (name, description, price, retail_price, quantity, type_id, image, barcode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description,
        data.price,
        data.retail_price,
        data.quantity,
        data.type_id,
        data.image,
        data.barcode
      ],
      callback
    );
  },

  update(id, data, callback) {
    db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, retail_price = ?, quantity = ?, type_id = ?, image = ?, barcode = ?
       WHERE id = ?`,
      [
        data.name,
        data.description,
        data.price,
        data.retail_price,
        data.quantity,
        data.type_id,
        data.image,
        data.barcode,
        id
      ],
      callback
    );
  },

  delete(id, callback) {
    db.query('DELETE FROM products WHERE id = ?', [id], callback);
  },

  updateImage(id, image, callback) {
    db.query(
      'UPDATE products SET image = ? WHERE id = ?',
      [image, id],
      callback
    );
  },

  findByIds(ids, callback) {
    db.query(
      `SELECT products.*, product_types.name AS type_name, product_types.description AS type_description
      FROM products
      LEFT JOIN product_types ON products.type_id = product_types.id
      WHERE products.id IN (?)`,
      [ids],
      callback
    );
  },
};

module.exports = Product;