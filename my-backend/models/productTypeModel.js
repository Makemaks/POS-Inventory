const mongoose = require('mongoose');

const productTypeSchema = new mongoose.Schema({
    name: String,
    description: String
});

const ProductType = mongoose.model('ProductType', productTypeSchema);

module.exports = ProductType;
