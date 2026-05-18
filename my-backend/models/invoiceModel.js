const db = require('../config/db');

const Invoice = {
  getAll(callback) {
    db.query(
      `SELECT invoices.*, users.name AS user_name
       FROM invoices
       LEFT JOIN users ON invoices.user_id = users.id`,
      callback
    );
  },

  findById(id, callback) {
    db.query('SELECT * FROM invoices WHERE id = ?', [id], callback);
  },

  findItems(invoiceId, callback) {
    db.query(
      `SELECT invoice_items.*, products.name AS product_name
       FROM invoice_items
       LEFT JOIN products ON invoice_items.product_id = products.id
       WHERE invoice_items.invoice_id = ?`,
      [invoiceId],
      callback
    );
  },

  create(data, callback) {
    db.query(
      'INSERT INTO invoices (user_id, total_amount, total_profit) VALUES (?, ?, ?)',
      [data.user_id, data.total_amount, data.total_profit],
      callback
    );
  },

  addItem(data, callback) {
    db.query(
      'INSERT INTO invoice_items (invoice_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [data.invoice_id, data.product_id, data.quantity, data.price],
      callback
    );
  },

  delete(id, callback) {
    db.query('DELETE FROM invoices WHERE id = ?', [id], callback);
  }
};

module.exports = Invoice;   