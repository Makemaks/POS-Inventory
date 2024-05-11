// userController.js
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const bcrypt = require('bcrypt');

// Utility function to hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const hashedPassword = await hashPassword(req.body.password);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'user',
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role'); // Populate the 'role' field
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
