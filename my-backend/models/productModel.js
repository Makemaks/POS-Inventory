const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    retailPrice: Number,
    quantity: Number,
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductType'
    },
    image: String,
    barcode: String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
