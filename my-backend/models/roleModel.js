const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['user', 'admin', 'manager'] // Add more roles as needed
    }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;