// seeder.js

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const ProductType = require('../models/productTypeModel');
const Product = require('../models/productModel');
const Invoice = require('../models/invoiceModel'); // Ensure Invoice model is defined

const roles = [
    { name: 'user' },
    { name: 'admin' }
];

const productTypes = [
    { name: 'Product', description: 'Overall product' },
    { name: 'Non-Alcoholic Beverage', description: 'Non-alcoholic drinks like juices and sodas' },
    { name: 'Alcoholic Beverage', description: 'Alcoholic drinks like wine and beer' },
    { name: 'Snacks', description: 'Chips, nuts, and other snacks' },
    { name: 'Confectionery', description: 'Candies, chocolates, and sweets' },
    { name: 'Fast Food', description: 'Burgers, pizzas, and other fast food items' },
    { name: 'Bath and Body', description: 'Soaps, shower gels, and body lotions' },
    { name: 'Hair Care', description: 'Shampoos, conditioners, and hair treatments' },
    { name: 'Oral Care', description: 'Toothpaste, toothbrushes, and mouthwash' },
    { name: 'Household Cleaning', description: 'Dish soap, laundry detergent, and disinfectants' },
    { name: 'Paper Products', description: 'Toilet paper, paper towels, and napkins' },
    { name: 'Personal Care', description: 'Deodorants, razors, and shaving cream' },
    { name: 'Cooking Essentials', description: 'Cooking oil, salt, sugar, and flour' },
    { name: 'Condiments and Spices', description: 'Ketchup, soy sauce, vinegar, and seasoning packets' },
    { name: 'Canned Goods', description: 'Canned meats, fish, fruits, and vegetables' }
];

const deleteAllDocuments = async (Model) => {
    try {
        await Model.deleteMany({});
        console.log(`Deleted all documents from ${Model.collection.name}`);
    } catch (error) {
        console.error(`Error deleting documents from ${Model.collection.name}:`, error);
        throw error;
    }
};

const baseUrl = 'http://localhost:3001';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        await deleteAllDocuments(Role);
        await deleteAllDocuments(User);
        await deleteAllDocuments(ProductType);
        await deleteAllDocuments(Product);
        await deleteAllDocuments(Invoice);

        return Role.insertMany(roles);
    })
    .then(async (insertedRoles) => {
        console.log('Roles seeded successfully:', insertedRoles);
        const usersToInsert = [
            { name: 'User', email: 'user@gmail.com', password: 'password', role: insertedRoles[0]._id },
            { name: 'Admin', email: 'admin@gmail.com', password: 'password', role: insertedRoles[1]._id }
        ];
        const hashedPassword = await bcrypt.hash('password', 10);
        usersToInsert.forEach(user => user.password = hashedPassword);
        const insertedUsers = await User.insertMany(usersToInsert);
        return insertedUsers;
    })
    .then(async (insertedUsers) => {
        console.log('Users seeded successfully:', insertedUsers);
        const insertedProductTypes = await ProductType.insertMany(productTypes);
        return { insertedUsers, insertedProductTypes };
    })
    .then(async ({ insertedUsers, insertedProductTypes }) => {
        console.log('Product Types seeded successfully:', insertedProductTypes);
        const productMap = new Map(insertedProductTypes.map(pt => [pt.name, pt._id]));

        const products = [
            { name: 'Del Monte Pineapple Juice', description: 'Juice drink', price: 20, retailPrice: 25, quantity: 50, type: productMap.get('Non-Alcoholic Beverage'), image: `${baseUrl}/images/del-monte-pineapple-juice.jpg`, barcode: '1234567890123' },
            { name: 'C2 Green Tea', description: 'Green tea drink', price: 15, retailPrice: 20, quantity: 100, type: productMap.get('Non-Alcoholic Beverage'), image:  `${baseUrl}/images/c2-green-tea.jpg`, barcode: '1234567890123' },
            { name: 'RC Cola', description: 'Soft drink', price: 18, retailPrice: 22, quantity: 70, type: productMap.get('Non-Alcoholic Beverage'), image:  `${baseUrl}/images/rc-cola.jpg`, barcode: '1234567890123' },

            { name: 'San Miguel Pale Pilsen', description: 'Beer', price: 35, retailPrice: 40, quantity: 30, type: productMap.get('Alcoholic Beverage'), image:  `${baseUrl}/images/san-miguel-pale-pilsen.jpg`, barcode: '1234567890123' },
            { name: 'Red Horse', description: 'Strong beer', price: 45, retailPrice: 50, quantity: 25, type: productMap.get('Alcoholic Beverage'), image:  `${baseUrl}/images/red-horse.jpg`, barcode: '1234567890123' },
            { name: 'Tanduay Rhum', description: 'Rum', price: 55, retailPrice: 65, quantity: 40, type: productMap.get('Alcoholic Beverage'), image:  `${baseUrl}/images/tanduay-rhum.jpg`, barcode: '1234567890123' },

            { name: 'Chippy', description: 'Chips', price: 15, retailPrice: 18, quantity: 100, type: productMap.get('Snacks'), image:  `${baseUrl}/images/chippy.jpg`, barcode: '1234567890123' },
            { name: 'Piattos', description: 'Potato crisps', price: 20, retailPrice: 25, quantity: 80, type: productMap.get('Snacks'), image:  `${baseUrl}/images/piattos.jpg`, barcode: '1234567890123' },
            { name: 'Nova', description: 'Fiber-rich chips', price: 18, retailPrice: 22, quantity: 90, type: productMap.get('Snacks'), image:  `${baseUrl}/images/nova.jpg`, barcode: '1234567890123' },

            { name: 'Flat Tops', description: 'Chocolate', price: 5, retailPrice: 7, quantity: 200, type: productMap.get('Confectionery'), image:  `${baseUrl}/images/flat-tops.jpg`, barcode: '1234567890123' },
            { name: 'Curly Tops', description: 'Chocolate', price: 6, retailPrice: 8, quantity: 180, type: productMap.get('Confectionery'), image:  `${baseUrl}/images/curly-tops.jpg`, barcode: '1234567890123' },
            { name: 'Hany', description: 'Peanut milk chocolate', price: 10, retailPrice: 12, quantity: 150, type: productMap.get('Confectionery'), image:  `${baseUrl}/images/hany.jpg`, barcode: '1234567890123' },

            { name: 'Safeguard', description: 'Soap', price: 45, retailPrice: 50, quantity: 60, type: productMap.get('Bath and Body'), image:  `${baseUrl}/images/safeguard.jpg`, barcode: '1234567890123' },
            { name: 'Perla', description: 'Laundry soap', price: 35, retailPrice: 40, quantity: 50, type: productMap.get('Bath and Body'), image:  `${baseUrl}/images/perla.jpg`, barcode: '1234567890123' },
            { name: 'Silka Papaya Lotion', description: 'Papaya lotion', price: 90, retailPrice: 100, quantity: 40, type: productMap.get('Bath and Body'), image:  `${baseUrl}/images/silka-papaya-lotion.jpg`, barcode: '1234567890123' },

            { name: 'Sunsilk Shampoo', description: 'Shampoo', price: 90, retailPrice: 100, quantity: 40, type: productMap.get('Hair Care'), image:  `${baseUrl}/images/sunsilk-shampoo.jpg`, barcode: '1234567890123' },
            { name: 'Palmolive Shampoo', description: 'Shampoo', price: 80, retailPrice: 90, quantity: 30, type: productMap.get('Hair Care'), image: '', barcode: '1234567890123' },
            { name: 'Cream Silk', description: 'Hair conditioner', price: 85, retailPrice: 95, quantity: 25, type: productMap.get('Hair Care'), image: '', barcode: '1234567890123' },

            { name: 'Hapee Toothpaste', description: 'Toothpaste', price: 25, retailPrice: 30, quantity: 80, type: productMap.get('Oral Care'), image: '', barcode: '1234567890123' },
            { name: 'Colgate Toothpaste', description: 'Toothpaste', price: 35, retailPrice: 40, quantity: 70, type: productMap.get('Oral Care'), image: '', barcode: '1234567890123' },

            { name: 'Joy Dishwashing Liquid', description: 'Dish soap', price: 30, retailPrice: 35, quantity: 70, type: productMap.get('Household Cleaning'), image: '', barcode: '1234567890123' },
            { name: 'Surf Detergent Powder', description: 'Laundry detergent', price: 50, retailPrice: 60, quantity: 60, type: productMap.get('Household Cleaning'), image: '', barcode: '1234567890123' },
            { name: 'Lysol Disinfectant', description: 'Disinfectant', price: 150, retailPrice: 170, quantity: 40, type: productMap.get('Household Cleaning'), image: '', barcode: '1234567890123' },

            { name: 'Sanicare Toilet Paper', description: 'Toilet paper', price: 10, retailPrice: 12, quantity: 300, type: productMap.get('Paper Products'), image: '', barcode: '1234567890123' },
            { name: 'Tisyu Toilet Paper', description: 'Toilet paper', price: 8, retailPrice: 10, quantity: 250, type: productMap.get('Paper Products'), image: '', barcode: '1234567890123' },

            { name: 'Rexona Deodorant', description: 'Deodorant', price: 75, retailPrice: 85, quantity: 50, type: productMap.get('Personal Care'), image: '', barcode: '1234567890123' },
            { name: 'Dove Deodorant', description: 'Deodorant', price: 80, retailPrice: 90, quantity: 40, type: productMap.get('Personal Care'), image: '', barcode: '1234567890123' },

            { name: 'Minola Cooking Oil', description: 'Cooking oil', price: 100, retailPrice: 110, quantity: 20, type: productMap.get('Cooking Essentials'), image: '', barcode: '1234567890123' },
            { name: 'Marca Leon Cooking Oil', description: 'Cooking oil', price: 95, retailPrice: 105, quantity: 25, type: productMap.get('Cooking Essentials'), image: '', barcode: '1234567890123' },

            { name: 'Datu Puti Soy Sauce', description: 'Soy sauce', price: 10, retailPrice: 12, quantity: 150, type: productMap.get('Condiments and Spices'), image: '', barcode: '1234567890123' },
            { name: 'Silver Swan Soy Sauce', description: 'Soy sauce', price: 12, retailPrice: 14, quantity: 130, type: productMap.get('Condiments and Spices'), image: '', barcode: '1234567890123' },
            { name: 'UFC Ketchup', description: 'Banana ketchup', price: 15, retailPrice: 18, quantity: 140, type: productMap.get('Condiments and Spices'), image: '', barcode: '1234567890123' },

            { name: 'Argentina Corned Beef', description: 'Canned meat', price: 45, retailPrice: 50, quantity: 90, type: productMap.get('Canned Goods'), image: '', barcode: '1234567890123' },
            { name: 'Century Tuna', description: 'Canned tuna', price: 35, retailPrice: 40, quantity: 100, type: productMap.get('Canned Goods'), image: '', barcode: '1234567890123' },
            { name: 'Ligo Sardines', description: 'Canned sardines', price: 25, retailPrice: 30, quantity: 110, type: productMap.get('Canned Goods'), image: '' }
        ];

        const insertedProducts = await Product.insertMany(products);
        return { insertedProducts, insertedUsers };
    })
    .then(({ insertedProducts, insertedUsers }) => {
        console.log('Products seeded successfully:', insertedProducts);
    
        const invoices = [];
        const user = insertedUsers[0]; // Use the first user in the array
        const startDate = new Date(2024, 0, 1); // Start from January 1, 2024
        const endDate = new Date(2024, 11, 31, 23, 59, 59); // End at December 31, 2024
    
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
            for (let hour = 0; hour < 24; hour++) {
                let hourInvoices = Math.floor(Math.random() * 6) + 1; // Random number of invoices from 1 to 6
    
                // Generate invoices with gaps
                for (let i = 0; i < hourInvoices; i++) {
                    // Introduce a random gap between invoices
                    const gapMinutes = Math.floor(Math.random() * 30); // Random gap of up to 30 minutes
                    const createdAt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, gapMinutes);
    
                    const randomItems = insertedProducts
                        .sort(() => 0.5 - Math.random())
                        .slice(0, Math.floor(Math.random() * 3) + 1)
                        .map(product => ({
                            product: product._id,
                            quantity: Math.floor(Math.random() * 5) + 1,
                            price: product.retailPrice,
                        }));
    
                    const totalAmount = randomItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
                    const totalProfit = randomItems.reduce((sum, item) => sum + item.quantity * (item.price - item.price * 0.2), 0);
    
                    const invoice = new Invoice({
                        user: user._id,
                        items: randomItems,
                        totalAmount,
                        totalProfit,
                        createdAt,
                        updatedAt: createdAt,
                    });
    
                    invoices.push(invoice);
                }
            }
        }
    
        return Invoice.insertMany(invoices);
    })    
    .then((insertedInvoices) => {
        console.log(`Invoices seeded successfully: ${insertedInvoices.length}`);
        return mongoose.disconnect();
    })
    .then(() => {
        console.log('Disconnected from MongoDB');
    })
    .catch(err => {
        console.error('Error seeding data:', err);
    });
