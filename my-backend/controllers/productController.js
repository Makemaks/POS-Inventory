const Product = require('../models/productModel');
const ProductType = require('../models/productTypeModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

exports.updateProductImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      Product.findById(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!results.length) {
          return res.status(404).json({ error: 'Product not found' });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No image uploaded' });
        }

        const existingProduct = results[0];

        if (existingProduct.image) {
          try {
            const oldImageName = path.basename(existingProduct.image);
            fs.unlinkSync(path.join('public/images', oldImageName));
          } catch (error) {
            console.warn('Error deleting old image:', error.message);
          }
        }

        const baseUrl = 'http://localhost:3001';
        const image = `${baseUrl}/images/${req.file.filename}`;

        Product.updateImage(req.params.id, image, (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }

          res.json({
            ...existingProduct,
            image,
          });
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      retailPrice,
      quantity,
      type,
      image,
      barcode,
    } = req.body;

    const productData = {
      name,
      description,
      price,
      retail_price: retailPrice,
      quantity,
      type_id: type,
      image,
      barcode,
    };

    Product.create(productData, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: result.insertId,
        ...productData,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    Product.getAll((err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    Product.findById(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!results.length) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(results[0]);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      retailPrice,
      quantity,
      type,
      image,
      barcode,
    } = req.body;

    ProductType.findById(type, (typeErr, typeResults) => {
      if (typeErr) return res.status(500).json({ error: typeErr.message });

      if (!typeResults.length) {
        return res.status(404).json({ error: 'Product type not found' });
      }

      const productData = {
        name,
        description,
        price,
        retail_price: retailPrice,
        quantity,
        type_id: type,
        image,
        barcode,
      };

      Product.update(req.params.id, productData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
          id: req.params.id,
          ...productData,
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    Product.delete(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductInfoByBarcode = async (req, res) => {
  const barcode = req.params.barcode.trim().replace(/\s+/g, '');
  const apiKey = 'd2ik9rhdjhjhiqesmbmle45aal77jw';
  const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data?.products?.length > 0) {
      res.json(response.data.products[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product info' });
  }
};

exports.getProductsByIds = async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({
      message: 'Invalid input, array of product IDs expected.',
    });
  }

  try {
    Product.findByIds(productIds, (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch products.', error: err.message });

      if (!results.length) {
        return res.status(404).json({
          message: 'No products found for the provided IDs.',
        });
      }

      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.', error });
  }
};