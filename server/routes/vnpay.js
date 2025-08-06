const express = require('express');
const config = require('config');
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const Order = require('../models/order');

const router = express.Router();

// Route xử lý tạo URL thanh toán VNPay
router.post('/vnpay', async (req, res) => { // Make this async
    try {
        const { totalPrice, user, orderId } = req.body; // Lấy orderId từ body

        // Kiểm tra tham số đầu vào
        if (!totalPrice || !user || !orderId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Tạo các giá trị cần thiết
        const createDate = moment().format('YYYYMMDDHHmmss');

        // Tham số gửi tới VNPay
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: config.get('vnp_TmnCode'),
            vnp_Amount: totalPrice * 100, // Nhân 100 để chuyển sang đơn vị nhỏ nhất
            vnp_CreateDate: createDate,
            vnp_CurrCode: 'VND',
            vnp_IpAddr: req.headers['x-forwarded-for'] || req.ip,
            vnp_Locale: 'vn',
            vnp_OrderInfo: `Payment for orderId ${orderId}`, // Thay đổi thông tin đơn hàng
            vnp_OrderType: 'other',
            vnp_ReturnUrl: config.get('vnp_ReturnUrl'),
            vnp_TxnRef: orderId, // Sử dụng orderId từ body
        };

        // Tạo URL và chữ ký
        const { paymentUrl, secureHash } = generatePaymentUrl(vnp_Params, config.get('vnp_HashSecret'));

        console.log("Generated Secure Hash:", secureHash);
        res.json({ url: paymentUrl });
    } catch (error) {
        console.error("Error generating payment URL:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route tạo URL thanh toán
router.post('/create_payment_url', (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnpUrl = config.get('vnp_Url');
    let returnUrl = config.get('vnp_ReturnUrl');
    let amount = req.body.amount;
    let bankCode = req.body.bankCode || '';

    let locale = req.body.language || 'vn';
    let currCode = 'VND';
    
    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: req.body.orderId, // Lấy orderId từ body
        vnp_OrderInfo: 'Thanh toan cho ma GD:' + req.body.orderId,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };

    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    console.log('check vnpay');
    res.send(vnpUrl);
});

// Hàm sắp xếp các tham số
function sortObject(obj) {
    let sorted = {};
    let str = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let key of str) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    }
    return sorted;
}

// Route xử lý phản hồi từ VNPay
router.get('/vnpay_return', async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các tham số chữ ký để xác thực
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp các tham số để chuẩn bị ký
    vnp_Params = sortObject(vnp_Params);

    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');

    // Log ra vnp_Params và vnp_ResponseCode để kiểm tra
    console.log("vnp_Params:", vnp_Params);
    console.log("vnp_ResponseCode:", vnp_Params['vnp_ResponseCode']);

    // Tạo chữ ký dữ liệu
    let signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    // Kiểm tra chữ ký nếu hợp lệ
    if (secureHash === signed) {
        // Xác định trạng thái giao dịch
        let orderStatus = vnp_Params['vnp_ResponseCode'] === '00' ? 'success' : 'error';
        let total = vnp_Params['vnp_Amount'] ? parseInt(vnp_Params['vnp_Amount'], 10) / 100 : 0; 
        let orderId = vnp_Params['vnp_TxnRef']; // Đây sẽ là ObjectId

        const redirectToPaymentSuccessPage = (status) => `
        <html>
        <head>
            <meta http-equiv="refresh" content="0; url=http://localhost:3000/payment/${status}?amount=${total}&orderId=${orderId}" />
        </head>
        <body>
            <p>Redirecting to payment ${status} page...</p>
        </body>
        </html>
        `;

        // Trả về trang sau khi kiểm tra thành công
        res.status(200).send(redirectToPaymentSuccessPage(orderStatus));
    } else {
        console.error("Signature validation failed");
        res.status(400).send("Invalid signature");
    }
});

// Export router
module.exports = router;