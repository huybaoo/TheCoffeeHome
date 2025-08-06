const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: Object, required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, required: true },
            name: { type: String, required: true }, 
            price: { type: Number, required: true },
            note: { type: String }, 
            selectedSize: { type: String, required: true },
            selectedToppings: { type: [String], required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    method: { type: String, default: 'Chưa thanh toán' }, 
    status: { type: String, default: 'Chưa được xác nhận' }, 
    createdAt: { type: Date, default: Date.now }
}, { collection: 'order' });

module.exports = mongoose.model('Order', orderSchema);