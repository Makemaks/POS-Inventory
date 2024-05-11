const express = require('express');

const {
    createUser,
    getUser,
    loginUser
} = require('../controllers/userController');

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductImage,
    getProductInfoByBarcode,
    getProductsByIds
} = require('../controllers/productController');

const {
    getAllProductTypes,
    createProductType,
    getProductTypeById,
    deleteProductType
} = require('../controllers/productTypeController');

const {
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    invoicesPerMonth,
    profitPerMonth,
    getInvoicesByHour,
    getInvoice
} = require('../controllers/invoiceController'); 

const router = express.Router();

//Graphs
router.get('/invoices/monthly-invoice', invoicesPerMonth);
router.get('/invoices/monthly-profit', profitPerMonth);
router.get('/invoices/hourly-invoice', getInvoicesByHour);

// User routes
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.post('/login', loginUser);

// Product routes
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.post('/products/many', getProductsByIds);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put("/products/:id/image", updateProductImage);
router.get('/products/lookup/:barcode', getProductInfoByBarcode);

// Product Type routes
router.post('/product-types', createProductType);
router.get('/product-types', getAllProductTypes);
router.get('/product-types/:id', getProductTypeById);
router.put('/product-types/:id', deleteProductType);

// Invoice routes
router.post('/invoices', createInvoice);
router.get('/invoices', getInvoice);
router.get('/invoices/:id', getInvoiceById);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);

module.exports = router;
