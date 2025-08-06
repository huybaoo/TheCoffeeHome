const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    codename: { type: String, required: true },
    percent: { type: Number, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Kích hoạt', 'Vô hiệu hóa'], default: 'Kích hoạt' }, 
}, { collection: 'discountcode' });

module.exports = mongoose.model('Discountcode', discountSchema);