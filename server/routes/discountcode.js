const express = require('express');
const router = express.Router();
const Discountcode = require('../models/discountcode');

// Lấy tất cả mã giảm giá
router.get('/', async (req, res) => {
    try {
        const discountCodes = await Discountcode.find();
        res.json(discountCodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Thêm mã giảm giá
router.post('/', async (req, res) => {
    const { codename, percent, description, status } = req.body;

    const discountCode = new Discountcode({
        codename,
        percent,
        description,
        status
    });

    try {
        const newDiscountCode = await discountCode.save();
        res.status(201).json(newDiscountCode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Sửa mã giảm giá
router.put('/:id', async (req, res) => {
    const { codename, percent, description, status } = req.body;

    try {
        const discountCode = await Discountcode.findById(req.params.id);
        if (!discountCode) return res.status(404).json({ message: 'Mã giảm giá không tìm thấy' });

        discountCode.codename = codename || discountCode.codename;
        discountCode.percent = percent || discountCode.percent;
        discountCode.description = description || discountCode.description;
        discountCode.status = status || discountCode.status;

        const updatedDiscountCode = await discountCode.save();
        res.json(updatedDiscountCode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Xóa mã giảm giá
router.delete('/:id', async (req, res) => {
    try {
        const discountCode = await Discountcode.findById(req.params.id);
        if (!discountCode) return res.status(404).json({ message: 'Mã giảm giá không tìm thấy' });

        
        await Discountcode.findByIdAndDelete(req.params.id);
        res.json({ message: 'Mã giảm giá đã xóa' });
    } catch (error) {
        console.error(error); // Ghi lại lỗi
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;