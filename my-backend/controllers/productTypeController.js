const ProductType = require('../models/productTypeModel');

// Get all product types
exports.getAllProductTypes = async (req, res) => {
    try {
        const productTypes = await ProductType.find();
        res.json(productTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new product type
exports.createProductType = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newProductType = new ProductType({ name, description });
        const savedProductType = await newProductType.save();
        res.status(201).json(savedProductType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a product type by ID
exports.getProductTypeById = async (req, res) => {
    try {
        const productType = await ProductType.findById(req.params.id);
        if (!productType) {
            return res.status(404).json({ error: 'Product type not found' });
        }
        res.json(productType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a product type by ID
exports.deleteProductType = async (req, res) => {
    try {
        const deletedProductType = await ProductType.findByIdAndDelete(req.params.id);
        if (!deletedProductType) {
            return res.status(404).json({ error: 'Product type not found' });
        }
        res.json({ message: 'Product type deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
