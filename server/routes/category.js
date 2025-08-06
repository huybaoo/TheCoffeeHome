const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const mongoose = require('mongoose');

// API để lấy danh sách category
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API để thêm category
router.post('/', async (req, res) => {
    const newCategory = new Category({ Type: req.body.Type });
    try {
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API để sửa category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
    }
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, { Type: req.body.Type }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category không tìm thấy" });
        }
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API để xóa category
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category không tìm thấy" });
        }
        res.json({ message: "Category đã bị xóa" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;