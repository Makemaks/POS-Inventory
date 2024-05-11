const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const invoiceSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    totalProfit: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to convert timestamps to Asia/Shanghai timezone before saving
invoiceSchema.pre('save', function(next) {
    this.createdAt = moment.utc(this.createdAt).tz('Asia/Shanghai').toDate();
    this.updatedAt = moment.utc(this.updatedAt).tz('Asia/Shanghai').toDate();
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
