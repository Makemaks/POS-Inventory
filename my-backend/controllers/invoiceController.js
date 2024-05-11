const Invoice = require('../models/invoiceModel'); 
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Create a new invoice
const createInvoice = async (req, res) => {
    try {
        const { user, items, totalAmount, totalProfit } = req.body;

        // Convert current time to Asia/Shanghai timezone
        const currentTime = new Date();
        const shanghaiTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));

        // Save the invoice with converted timestamps
        const invoice = new Invoice({
            user: new mongoose.Types.ObjectId(user),
            items: items.map(item => ({
                product: new mongoose.Types.ObjectId(item._id),
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            totalProfit,
            createdAt: shanghaiTime,
            updatedAt: shanghaiTime
        });
        
        await invoice.save();

        // Update the product quantities without transactions
        for (const item of items) {
            console.log(item)
            const product = await Product.findById(item._id);
            if (!product) {
                throw new Error(`Product ${item.product} not found`);
            }

            // Check if the quantity is sufficient
            if (product.quantity < item.quantity) {
                throw new Error(`Not enough stock for product ${product.name}`);
            }

            // Subtract the quantity from the product
            product.quantity -= item.quantity;

            // Save the updated product
            await product.save();
        }

        res.status(201).json(invoice);

    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Error creating invoice', error: error.message || 'Unknown error' });
    }
};


const getInvoice = async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) {
            dateFilter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.createdAt.$lte = new Date(endDate);
        }
    }

    try {
        const invoices = await Invoice.find(dateFilter);
        console.log("Fetched Invoices:", invoices);
        const populatedInvoices = await Invoice.populate(invoices, [
            { path: 'user', model: 'User' },
            { path: 'items.product', model: 'Product' }
        ]);
        console.log("Populated Invoices:", populatedInvoices);
        res.json(populatedInvoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Failed to fetch invoices', error: error.message });
    }
};



// Get an invoice by ID
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id)
            .populate('user')
            .populate('items.product');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice', error });
    }
};

// Update an invoice by ID
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, items, totalAmount, totalProfit } = req.body;

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            {
                user: mongoose.Types.ObjectId(user),
                items: items.map(item => ({
                    product: mongoose.Types.ObjectId(item.product),
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount,
                totalProfit,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoice', error });
    }
};

// Delete an invoice by ID
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting invoice', error });
    }
};

const invoicesPerMonth = async (req, res) => {
    try {
        const invoices = await Invoice.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } }, // Group by year and month
                    totalInvoices: { $sum: 1 }, // Count the invoices
                }
            },
            { $sort: { "_id.month": 1 } } // Sort by month
        ]);

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};

const profitPerMonth = async (req, res) => {
    try {
        // Aggregate the invoices to calculate total profit per month
        const invoices = await Invoice.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } }, // Group by year and month
                    totalProfit: { $sum: "$totalProfit" }, // Calculate total profit
                }
            },
            { $sort: { "_id.month": 1 } } // Sort by month
        ]);

        // Send the calculated total profit per month as response
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};

const getInvoicesByHour = async (req, res) => {
    try {
      const invoicesByHour = await Invoice.aggregate([
        {
          $group: {
            _id: { $hour: "$createdAt" }, // Group by hour of createdAt field
            count: { $sum: 1 } // Count the invoices
          }
        }
      ]);
  
      res.json(invoicesByHour);
    } catch (error) {
      console.error('Error fetching invoices by hour:', error);
      res.status(500).json({ message: 'Error fetching invoices by hour', error: error.message });
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
    getInvoicesByHour
};
