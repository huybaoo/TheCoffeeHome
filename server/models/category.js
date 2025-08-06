const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    Type: String
}, { collection: 'category' });

module.exports = mongoose.model('Category', categorySchema);