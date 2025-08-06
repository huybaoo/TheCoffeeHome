const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: String,
    password: String
}, { collection: 'admin' });

module.exports = mongoose.model('Admin', adminSchema);