const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
db();

// Định nghĩa các router
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const orderRouter = require('./routes/order');
const customerRouter = require('./routes/customer');
const vnpayRouter = require('./routes/vnpay');
const adminRouter = require('./routes/admin');
const discountRouter = require('./routes/discountcode');
const ratingRouter = require('./routes/rating');
const chatbotRouter = require('./routes/chatbox');

// Sử dụng router
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/vnpay', vnpayRouter);
app.use('/api/v1/admin', adminRouter); 
app.use('/api/v1/discountcode', discountRouter);
app.use('/api/v1/ratings', ratingRouter);
app.use('/api/v1/chatbox', chatbotRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});