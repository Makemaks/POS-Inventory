const Product = require('../models/productModel');
const ProductType = require('../models/productTypeModel');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require('axios');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const upload = multer({ storage: storage });

// Controller function to update a product's image by ID
exports.updateProductImage = [
    upload.single("image"),
    async (req, res) => {
      try {
        const existingProduct = await Product.findById(req.params.id);
  
        if (!existingProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
  
        // If there is a previous image, try deleting it safely
        if (existingProduct.image) {
          try {
            fs.unlinkSync(path.join("public", existingProduct.image));
          } catch (error) {
            console.warn("Error deleting old image:", error.message);
          }
        }
  
        // Check if a file was uploaded
        if (!req.file) {
          return res.status(400).json({ error: "No image uploaded" });
        }
  
        // Update the image field
        const baseUrl = 'http://localhost:3001';
        existingProduct.image = `${baseUrl}/images/${req.file.filename}`;
        await existingProduct.save();
  
        res.json(existingProduct);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  ];

// Controller function to create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, retailPrice, quantity, type, image, barcode } = req.body;
        
        // Create a new product instance
        const newProduct = new Product({
            name,
            description,
            price,
            retailPrice,
            quantity,
            type,
            image,
            barcode,
        });
        
        // Save the product to the database
        const savedProduct = await newProduct.save();
        
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller function to get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('type'); // Populate the 'type' field with details from 'ProductType' model
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller function to get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('type'); // Populate the 'type' field with details from 'ProductType' model
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller function to update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, retailPrice, quantity, type, image } = req.body;

        // Check if the product type exists
        const productType = await ProductType.findById(type);
        if (!productType) {
            return res.status(404).json({ error: 'Product type not found' });
        }

        // Find the product by ID and update its fields
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, retailPrice, quantity, type, image },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller function to delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductInfoByBarcode = async (req, res) => {
  let barcode = req.params.barcode.trim().replace(/\s+/g, '');
  const apiKey = 'd2ik9rhdjhjhiqesmbmle45aal77jw'; // Replace with your actual API key

  const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${apiKey}`;
  console.log(apiUrl);

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.products && response.data.products.length > 0) {
      res.json(response.data.products[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product info' });
  }
};

exports.getProductsByIds = async (req, res) => {
  // Retrieve the array of product IDs from the request body
  const { productIds } = req.body;

  // Validate the input
  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({ message: 'Invalid input, array of product IDs expected.' });
  }

  try {
    // Fetch all products that match the given IDs and populate the 'type' field
    const products = await Product.find({
      '_id': { $in: productIds }
    }).populate('type', 'name description');  // Only include the 'name' and 'description' fields from ProductType

    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ message: 'No products found for the provided IDs.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.', error });
  }
};

