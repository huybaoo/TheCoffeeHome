const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

// API để lấy danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API để thêm sản phẩm
router.post('/', async (req, res) => {
    const newProduct = new Product(req.body);
    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API để sửa sản phẩm
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API để xóa sản phẩm
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
        }
        res.json({ message: "Sản phẩm đã bị xóa" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API tìm kiếm sản phẩm theo tên và mô tả
router.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Thiếu tham số tìm kiếm" });
    }

    try {
        // Tìm kiếm không phân biệt hoa thường trong tên và mô tả sản phẩm
        const searchResults = await Product.find({
            $or: [
                { Name: { $regex: query, $options: 'i' } },
                { Description: { $regex: query, $options: 'i' } }
            ]
        });

        res.json(searchResults);
    } catch (err) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", err);
        res.status(500).json({ message: "Lỗi server khi tìm kiếm sản phẩm" });
    }
});

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('Type');
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
        }

        // Lấy sản phẩm liên quan dựa trên Type (Category)
        const relatedProducts = await Product.find({
            Type: new mongoose.Types.ObjectId(product.Type._id),
            _id: { $ne: product._id }
        });

        // Random chọn 3 sản phẩm liên quan
        const shuffled = relatedProducts.sort(() => 0.5 - Math.random());
        const selectedRelatedProducts = shuffled.slice(0, 3); // Lấy 3 sản phẩm ngẫu nhiên

        res.json({
            product,
            relatedProducts: selectedRelatedProducts
        });
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
        res.status(500).json({ message: "Lỗi server khi lấy chi tiết sản phẩm" });
    }
});

// Lấy thông tin sản phẩm
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;