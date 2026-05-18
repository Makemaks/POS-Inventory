const ProductType = require('../models/productTypeModel');

exports.getAllProductTypes = async (req, res) => {
  try {
    ProductType.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProductType = async (req, res) => {
  try {
    const { name, description } = req.body;

    ProductType.create({ name, description }, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: result.insertId,
        name,
        description,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductTypeById = async (req, res) => {
  try {
    ProductType.findById(req.params.id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!results.length) {
        return res.status(404).json({ error: 'Product type not found' });
      }

      res.json(results[0]);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProductType = async (req, res) => {
  try {
    ProductType.delete(req.params.id, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product type not found' });
      }

      res.json({ message: 'Product type deleted successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};