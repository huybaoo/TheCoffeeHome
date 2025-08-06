const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Rating = require('../models/rating');
const Order = require('../models/order');

// API lấy tất cả feedback của khách hàng cho admin
router.get('/', async (req, res) => {
    try {
        const allRatings = await Rating.find().populate('userId', 'Name');
        res.status(200).json(allRatings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// API lấy đánh giá theo đơn hàng
router.get('/order-ratings/:orderId/:userId', async (req, res) => {
    const { orderId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    try {
        const ratings = await Rating.find({ orderId, userId }).populate('userId', 'Name');
        res.status(200).json(ratings);
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá theo đơn hàng:', error);
        res.status(500).json({ message: error.message });
    }
});

// API lấy đánh giá sản phẩm
router.get('/product-ratings/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const ratings = await Rating.find({ productId }).populate('userId', 'Name');
        res.status(200).json({ ratings });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá sản phẩm:', error);
        res.status(500).json({ message: error.message });
    }
});

// API gửi đánh giá
router.post('/rate-order', async (req, res) => {
    const { orderId, productId, rating, comment, userId } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!orderId || !productId || !userId || rating === undefined) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
    }

    if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    try {
        // Kiểm tra xem người dùng đã đánh giá sản phẩm này trong đơn hàng này chưa
        const existingRating = await Rating.findOne({ orderId, productId, userId });
        if (existingRating) {
            return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này.' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
        }

        // Kiểm tra thời gian đánh giá
        const orderDate = new Date(order.createdAt);
        const currentDate = new Date();
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // 1 tháng tính bằng milliseconds

        if (currentDate - orderDate > oneMonth) {
            return res.status(400).json({ message: 'Thời gian đánh giá đã hết hạn (1 tháng).' });
        }

        const newRating = new Rating({
            orderId: new mongoose.Types.ObjectId(orderId),
            productId: new mongoose.Types.ObjectId(productId),
            userId: new mongoose.Types.ObjectId(userId),
            rating,
            comment,
            orderDate: orderDate,
        });

        await newRating.save();
        res.status(201).json({ message: 'Đánh giá đã được lưu' });
    } catch (error) {
        console.error('Lỗi khi lưu đánh giá:', error);
        res.status(500).json({ message: error.message });
    }
});

// API admin trả lời feedback
router.put('/:id/reply', async (req, res) => {
    const { adminReply } = req.body;
    try {
        const updated = await Rating.findByIdAndUpdate(
            req.params.id,
            { adminReply },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;