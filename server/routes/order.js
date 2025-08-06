const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Nhập mongoose
const Order = require('../models/order');
const Product = require('../models/product');

// API tạo hóa đơn
router.post('/', async (req, res) => {
    const { user, products, totalPrice, method, status, note } = req.body;
    if (!user || !products || !totalPrice) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newOrder = new Order({ user, products, totalPrice, method, status, note });
    try {
        await newOrder.save();
        for (const product of products) {
            await Product.findByIdAndUpdate(product.productId, { $inc: { Stock: -product.quantity } });
        }
        res.status(201).json({ message: 'Order created successfully', orderId: newOrder._id });
    } catch (err) {
        console.error('Lỗi khi tạo đơn hàng:', err); // Ghi lại lỗi
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// API lịch sử hóa đơn theo tên người dùng
router.get('/name/:name', async (req, res) => {
    try {
        const orders = await Order.find({ 'user.Name': req.params.name }).populate('products.productId');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API để lấy tất cả đơn hàng trang admin
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('products.productId');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API để hủy đơn hàng và hoàn lại số lượng
router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID đơn hàng không hợp lệ." });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
        }

        if (order.status !== 'Chưa được xác nhận') {
            return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng chưa được xác nhận" });
        }

        // Hoàn lại số lượng sản phẩm
        await Promise.all(order.products.map(async (product) => {
            if (mongoose.Types.ObjectId.isValid(product.productId)) {
                await Product.findByIdAndUpdate(
                    product.productId,
                    { $inc: { Stock: product.quantity } }
                );
            }
        }));

        // Cập nhật trạng thái đơn hàng
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'Đơn hàng đã hủy' },
            { new: true }
        );

        res.json(updatedOrder);
    } catch (err) {
        console.error("Đã hủy đơn hàng.", err);
        res.status(500).json({ message: "Đã hủy đơn hàng.", error: err.message });
    }
});

// API để xác nhận đơn hàng
router.put('/confirm/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: 'Đã được xác nhận' }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
        }
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API để lấy sản phẩm bán chạy nhất
router.get('/top-selling', async (req, res) => {
    try {
        const confirmedOrders = await Order.find({ status: 'Đã giao thành công' });

        const productSales = {};

        // Tính toán số lượng bán cho từng sản phẩm
        confirmedOrders.forEach(order => {
            order.products.forEach(product => {
                const productId = product.productId._id.toString(); 
                const quantitySold = product.quantity; // Số lượng đã bán

                // Tạo một đối tượng sản phẩm để lưu thông tin
                productSales[productId] = productSales[productId] || {
                    productId: productId,
                    name: product.name,
                    price: product.price,
                    quantity: 0,
                    img: "" // Khởi tạo trường hình ảnh
                };
                productSales[productId].quantity += quantitySold; // Cộng dồn số lượng
            });
        });

        // Lấy thông tin sản phẩm từ cơ sở dữ liệu
        const productIds = Object.keys(productSales);
        const products = await Product.find({ _id: { $in: productIds } });

        // Cập nhật thông tin sản phẩm vào productSales
        products.forEach(product => {
            const productId = product._id.toString();
            if (productSales[productId]) {
                productSales[productId].img = product.Img; // Lưu hình ảnh
            }
        });

        // Chuyển đổi kết quả thành mảng và sắp xếp theo số lượng bán
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 8);

        res.json(sortedProducts);
    } catch (err) {
        console.error('Error fetching top-selling products:', err);
        res.status(500).json({ message: err.message });
    }
});

// API để cập nhật trạng thái đơn hàng sang đã thanh toán qua ngân hàng
router.put('/payment-success/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, 
            { status: 'Đã thanh toán qua ngân hàng' }, 
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
        }
        
        res.json(updatedOrder);
    } catch (err) {
        console.error("Lỗi khi cập nhật đơn hàng:", err); 
        res.status(500).json({ message: err.message });
    }
});

// API để cập nhật trạng thái đơn hàng sang đang được giao
router.put('/delivery/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: 'Đơn hàng đang được giao' }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
        }
        res.json(updatedOrder);
    } catch (err) {
        console.error("Lỗi khi cập nhật đơn hàng:", err);
        res.status(500).json({ message: err.message });
    }
});

// API để cập nhật trạng thái đơn hàng sang đã giao thành công
router.put('/received/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: 'Đã giao thành công' }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
        }
        res.json(updatedOrder);
    } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
        res.status(500).json({ message: err.message });
    }
});

// API lấy đơn hàng theo số điện thoại cho guest
router.get('/phone/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        const orders = await Order.find({ 'user.phone': phone }).populate('products.productId');
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào với số điện thoại này' });
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;