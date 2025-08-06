const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    Name: String,
    Description: String,
    Price: String,
    Img: String,
    Type: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    Brand: String,
    Stock: { type: Number, required: true },
}, { collection: 'product' });

module.exports = mongoose.model('Product', productSchema);