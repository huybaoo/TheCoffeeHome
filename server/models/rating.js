const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    orderDate: { type: Date, required: true },
    adminReply: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);