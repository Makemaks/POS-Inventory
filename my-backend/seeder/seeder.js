const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcrypt');
const db = require('../config/db');

const baseUrl = 'http://localhost:3001';

const roles = [
  { name: 'user' },
  { name: 'admin' },
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
  { name: 'Canned Goods', description: 'Canned meats, fish, fruits, and vegetables' },
];

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

async function seed() {
  try {
    console.log('Seeding started...');

    await query('SET FOREIGN_KEY_CHECKS = 0');

    await query('TRUNCATE TABLE invoice_items');
    await query('TRUNCATE TABLE invoices');
    await query('TRUNCATE TABLE time_slots');
    await query('TRUNCATE TABLE daily_schedules');
    await query('TRUNCATE TABLE products');
    await query('TRUNCATE TABLE product_types');
    await query('TRUNCATE TABLE users');
    await query('TRUNCATE TABLE roles');

    await query('SET FOREIGN_KEY_CHECKS = 1');

    for (const role of roles) {
      await query('INSERT INTO roles (name) VALUES (?)', [role.name]);
    }

    const roleRows = await query('SELECT * FROM roles');
    const roleMap = new Map(roleRows.map(role => [role.name, role.id]));

    const hashedPassword = await bcrypt.hash('password', 10);

    await query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      ['User', 'user@gmail.com', hashedPassword, roleMap.get('user')]
    );

    await query(
      'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@gmail.com', hashedPassword, roleMap.get('admin')]
    );

    for (const type of productTypes) {
      await query(
        'INSERT INTO product_types (name, description) VALUES (?, ?)',
        [type.name, type.description]
      );
    }

    const productTypeRows = await query('SELECT * FROM product_types');
    const productTypeMap = new Map(productTypeRows.map(type => [type.name, type.id]));

    const products = [
      ['Del Monte Pineapple Juice', 'Juice drink', 20, 25, 50, 'Non-Alcoholic Beverage', `${baseUrl}/images/del-monte-pineapple-juice.jpg`, '1234567890123'],
      ['C2 Green Tea', 'Green tea drink', 15, 20, 100, 'Non-Alcoholic Beverage', `${baseUrl}/images/c2-green-tea.jpg`, '1234567890123'],
      ['RC Cola', 'Soft drink', 18, 22, 70, 'Non-Alcoholic Beverage', `${baseUrl}/images/rc-cola.jpg`, '1234567890123'],

      ['San Miguel Pale Pilsen', 'Beer', 35, 40, 30, 'Alcoholic Beverage', `${baseUrl}/images/san-miguel-pale-pilsen.jpg`, '1234567890123'],
      ['Red Horse', 'Strong beer', 45, 50, 25, 'Alcoholic Beverage', `${baseUrl}/images/red-horse.jpg`, '1234567890123'],
      ['Tanduay Rhum', 'Rum', 55, 65, 40, 'Alcoholic Beverage', `${baseUrl}/images/tanduay-rhum.jpg`, '1234567890123'],

      ['Chippy', 'Chips', 15, 18, 100, 'Snacks', `${baseUrl}/images/chippy.jpg`, '1234567890123'],
      ['Piattos', 'Potato crisps', 20, 25, 80, 'Snacks', `${baseUrl}/images/piattos.jpg`, '1234567890123'],
      ['Nova', 'Fiber-rich chips', 18, 22, 90, 'Snacks', `${baseUrl}/images/nova.jpg`, '1234567890123'],

      ['Flat Tops', 'Chocolate', 5, 7, 200, 'Confectionery', `${baseUrl}/images/flat-tops.jpg`, '1234567890123'],
      ['Curly Tops', 'Chocolate', 6, 8, 180, 'Confectionery', `${baseUrl}/images/curly-tops.jpg`, '1234567890123'],
      ['Hany', 'Peanut milk chocolate', 10, 12, 150, 'Confectionery', `${baseUrl}/images/hany.jpg`, '1234567890123'],

      ['Safeguard', 'Soap', 45, 50, 60, 'Bath and Body', `${baseUrl}/images/safeguard.jpg`, '1234567890123'],
      ['Perla', 'Laundry soap', 35, 40, 50, 'Bath and Body', `${baseUrl}/images/perla.jpg`, '1234567890123'],
      ['Silka Papaya Lotion', 'Papaya lotion', 90, 100, 40, 'Bath and Body', `${baseUrl}/images/silka-papaya-lotion.jpg`, '1234567890123'],

      ['Sunsilk Shampoo', 'Shampoo', 90, 100, 40, 'Hair Care', `${baseUrl}/images/sunsilk-shampoo.jpg`, '1234567890123'],
      ['Palmolive Shampoo', 'Shampoo', 80, 90, 30, 'Hair Care', '', '1234567890123'],
      ['Cream Silk', 'Hair conditioner', 85, 95, 25, 'Hair Care', '', '1234567890123'],

      ['Hapee Toothpaste', 'Toothpaste', 25, 30, 80, 'Oral Care', '', '1234567890123'],
      ['Colgate Toothpaste', 'Toothpaste', 35, 40, 70, 'Oral Care', '', '1234567890123'],

      ['Joy Dishwashing Liquid', 'Dish soap', 30, 35, 70, 'Household Cleaning', '', '1234567890123'],
      ['Surf Detergent Powder', 'Laundry detergent', 50, 60, 60, 'Household Cleaning', '', '1234567890123'],
      ['Lysol Disinfectant', 'Disinfectant', 150, 170, 40, 'Household Cleaning', '', '1234567890123'],

      ['Sanicare Toilet Paper', 'Toilet paper', 10, 12, 300, 'Paper Products', '', '1234567890123'],
      ['Tisyu Toilet Paper', 'Toilet paper', 8, 10, 250, 'Paper Products', '', '1234567890123'],

      ['Rexona Deodorant', 'Deodorant', 75, 85, 50, 'Personal Care', '', '1234567890123'],
      ['Dove Deodorant', 'Deodorant', 80, 90, 40, 'Personal Care', '', '1234567890123'],

      ['Minola Cooking Oil', 'Cooking oil', 100, 110, 20, 'Cooking Essentials', '', '1234567890123'],
      ['Marca Leon Cooking Oil', 'Cooking oil', 95, 105, 25, 'Cooking Essentials', '', '1234567890123'],

      ['Datu Puti Soy Sauce', 'Soy sauce', 10, 12, 150, 'Condiments and Spices', '', '1234567890123'],
      ['Silver Swan Soy Sauce', 'Soy sauce', 12, 14, 130, 'Condiments and Spices', '', '1234567890123'],
      ['UFC Ketchup', 'Banana ketchup', 15, 18, 140, 'Condiments and Spices', '', '1234567890123'],

      ['Argentina Corned Beef', 'Canned meat', 45, 50, 90, 'Canned Goods', '', '1234567890123'],
      ['Century Tuna', 'Canned tuna', 35, 40, 100, 'Canned Goods', '', '1234567890123'],
      ['Ligo Sardines', 'Canned sardines', 25, 30, 110, 'Canned Goods', '', '1234567890123'],
    ];

    for (const product of products) {
      await query(
        `INSERT INTO products 
        (name, description, price, retail_price, quantity, type_id, image, barcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product[0],
          product[1],
          product[2],
          product[3],
          product[4],
          productTypeMap.get(product[5]),
          product[6],
          product[7],
        ]
      );
    }

    const users = await query('SELECT * FROM users WHERE email = ?', ['user@gmail.com']);
    const user = users[0];

    const insertedProducts = await query('SELECT * FROM products');

    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 11, 31, 23, 59, 59);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      for (let hour = 0; hour < 24; hour++) {
        const hourInvoices = Math.floor(Math.random() * 6) + 1;

        for (let i = 0; i < hourInvoices; i++) {
          const gapMinutes = Math.floor(Math.random() * 30);
          const createdAt = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            hour,
            gapMinutes
          );

          const randomItems = [...insertedProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1)
            .map(product => ({
              product_id: product.id,
              quantity: Math.floor(Math.random() * 5) + 1,
              price: product.retail_price,
            }));

          const totalAmount = randomItems.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          );

          const totalProfit = randomItems.reduce(
            (sum, item) => sum + item.quantity * (item.price - item.price * 0.2),
            0
          );

          const invoiceResult = await query(
            `INSERT INTO invoices 
            (user_id, total_amount, total_profit, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)`,
            [user.id, totalAmount, totalProfit, createdAt, createdAt]
          );

          const invoiceId = invoiceResult.insertId;

          for (const item of randomItems) {
            await query(
              `INSERT INTO invoice_items
              (invoice_id, product_id, quantity, price, created_at)
              VALUES (?, ?, ?, ?, ?)`,
              [
                invoiceId,
                item.product_id,
                item.quantity,
                item.price,
                createdAt,
              ]
            );
          }
        }
      }
    }

    console.log('Seeder completed successfully.');
    db.end();
  } catch (error) {
    console.error('Seeder failed:', error);
    db.end();
  }
}

seed();