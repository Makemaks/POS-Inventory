const db = require('../config/db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

const createInvoice = async (req, res) => {
  try {
    const { user, items, totalAmount, totalProfit } = req.body;

    const currentTime = new Date();
    const shanghaiTime = new Date(
      currentTime.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
    );

    await query('START TRANSACTION');

    const invoiceResult = await query(
      `INSERT INTO invoices 
       (user_id, total_amount, total_profit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [user, totalAmount, totalProfit, shanghaiTime, shanghaiTime]
    );

    const invoiceId = invoiceResult.insertId;

    for (const item of items) {
      const productId = item._id || item.product_id || item.product;

      const products = await query(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      if (!products.length) {
        throw new Error(`Product ${productId} not found`);
      }

      const product = products[0];

      if (product.quantity < item.quantity) {
        throw new Error(`Not enough stock for product ${product.name}`);
      }

      await query(
        `INSERT INTO invoice_items 
         (invoice_id, product_id, quantity, price, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, productId, item.quantity, item.price, shanghaiTime]
      );

      await query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, productId]
      );
    }

    await query('COMMIT');

    res.status(201).json({
      id: invoiceId,
      user_id: user,
      items,
      total_amount: totalAmount,
      total_profit: totalProfit,
      created_at: shanghaiTime,
      updated_at: shanghaiTime,
    });
  } catch (error) {
    await query('ROLLBACK').catch(() => {});

    console.error('Error creating invoice:', error);

    res.status(500).json({
      message: 'Error creating invoice',
      error: error.message || 'Unknown error',
    });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let sql = `
      SELECT 
        invoices.*,
        users.name AS user_name,
        users.email AS user_email
      FROM invoices
      LEFT JOIN users ON invoices.user_id = users.id
    `;

    const params = [];

    if (startDate || endDate) {
      sql += ' WHERE 1=1';

      if (startDate) {
        sql += ' AND invoices.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND invoices.created_at <= ?';
        params.push(endDate);
      }
    }

    sql += ' ORDER BY invoices.created_at DESC';

    const invoices = await query(sql, params);

    for (const invoice of invoices) {
      invoice.items = await query(
        `SELECT 
          invoice_items.*,
          products.name AS product_name,
          products.description AS product_description,
          products.image AS product_image,
          products.barcode AS product_barcode
        FROM invoice_items
        LEFT JOIN products ON invoice_items.product_id = products.id
        WHERE invoice_items.invoice_id = ?`,
        [invoice.id]
      );
    }

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);

    res.status(500).json({
      message: 'Failed to fetch invoices',
      error: error.message,
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoices = await query(
      `SELECT 
        invoices.*,
        users.name AS user_name,
        users.email AS user_email
      FROM invoices
      LEFT JOIN users ON invoices.user_id = users.id
      WHERE invoices.id = ?`,
      [id]
    );

    if (!invoices.length) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    invoice.items = await query(
      `SELECT 
        invoice_items.*,
        products.name AS product_name,
        products.description AS product_description,
        products.image AS product_image,
        products.barcode AS product_barcode
      FROM invoice_items
      LEFT JOIN products ON invoice_items.product_id = products.id
      WHERE invoice_items.invoice_id = ?`,
      [id]
    );

    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoice',
      error: error.message,
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, items, totalAmount, totalProfit } = req.body;

    await query('START TRANSACTION');

    const result = await query(
      `UPDATE invoices 
       SET user_id = ?, total_amount = ?, total_profit = ?, updated_at = ?
       WHERE id = ?`,
      [user, totalAmount, totalProfit, new Date(), id]
    );

    if (result.affectedRows === 0) {
      await query('ROLLBACK');
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

    for (const item of items) {
      const productId = item._id || item.product_id || item.product;

      await query(
        `INSERT INTO invoice_items 
         (invoice_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [id, productId, item.quantity, item.price]
      );
    }

    await query('COMMIT');

    res.json({
      id,
      user_id: user,
      items,
      total_amount: totalAmount,
      total_profit: totalProfit,
    });
  } catch (error) {
    await query('ROLLBACK').catch(() => {});

    res.status(500).json({
      message: 'Error updating invoice',
      error: error.message,
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM invoices WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting invoice',
      error: error.message,
    });
  }
};

const invoicesPerMonth = async (req, res) => {
  try {
    const invoices = await query(`
      SELECT 
        MONTH(created_at) AS month,
        COUNT(*) AS totalInvoices
      FROM invoices
      GROUP BY MONTH(created_at)
      ORDER BY month ASC
    `);

    res.json(
      invoices.map(row => ({
        _id: { month: row.month },
        totalInvoices: row.totalInvoices,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoices',
      error: error.message,
    });
  }
};

const profitPerMonth = async (req, res) => {
  try {
    const profits = await query(`
      SELECT 
        MONTH(created_at) AS month,
        SUM(total_profit) AS totalProfit
      FROM invoices
      GROUP BY MONTH(created_at)
      ORDER BY month ASC
    `);

    res.json(
      profits.map(row => ({
        _id: { month: row.month },
        totalProfit: Number(row.totalProfit),
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoices',
      error: error.message,
    });
  }
};

const getInvoicesByHour = async (req, res) => {
  try {
    const invoicesByHour = await query(`
      SELECT 
        HOUR(created_at) AS hour,
        COUNT(*) AS count
      FROM invoices
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `);

    res.json(
      invoicesByHour.map(row => ({
        _id: row.hour,
        count: row.count,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoices by hour',
      error: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  invoicesPerMonth,
  profitPerMonth,
  getInvoice,
  getInvoicesByHour,
};