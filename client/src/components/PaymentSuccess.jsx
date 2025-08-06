import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';

const PaymentSuccess = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const amount = queryParams.get('amount');
    const orderId = queryParams.get('orderId');

    useEffect(() => {
        localStorage.removeItem('cart'); 

        const storedOrder = localStorage.getItem('lastOrder');
        if (!storedOrder) {
            console.error("Không tìm thấy đơn hàng trong localStorage.");
            return;
        }
    
        const orderData = JSON.parse(storedOrder);
    
        if (!orderData || !orderData.user || !orderData.user.name || !orderData.user.address || !orderData.products) {
            console.error("Dữ liệu đơn hàng không hợp lệ.", orderData);
            return;
        }
    
        const confirmOrder = async () => {
            try {
                const response = await axios.put(`http://localhost:5000/api/v1/orders/confirm/${orderId}`);
                if (response.status === 200) {
                    alert('Đơn hàng đã được xác nhận.');
                }
            } catch (error) {
                console.error('Lỗi khi xác nhận đơn hàng:', error);
                alert('Có lỗi xảy ra khi xác nhận thanh toán.');
            }
        };
    
        // Chỉ gửi email nếu có email hợp lệ
        if (orderData.customerEmail && orderData.customerEmail.trim()) {
            sendEmailNotification(orderData);
        } else {
            console.warn("Không có email để gửi hóa đơn.");
        }
    
        localStorage.removeItem('lastOrder'); // Xóa đơn hàng sau khi gửi email
        confirmOrder(); // Gọi hàm xác nhận khi trang được tải lên
    }, [orderId]);
    

    const sendEmailNotification = (orderData) => {
        if (!orderData.customerEmail.trim()) {
            console.log("Không có email để gửi hóa đơn.");
            return;
        }

        const emailParams = {
            customer_name: orderData.user.name,
            customer_address: orderData.user.address,
            order_details: orderData.products.map(p => `${p.name} (x${p.quantity})`).join(', '),
            total_price: orderData.totalPrice.toLocaleString("vi-VN") + " VNĐ",
            to_email: orderData.customerEmail.trim(),
        };

        emailjs.send('service_wgo5m5a', 'template_ky0nso9', emailParams, '7oV_vV7xwhrwQvsb9')
            .then((response) => {
                console.log('Email sent successfully!', response.status, response.text);
            })
            .catch((error) => {
                console.error('Email send failed:', error);
            });
    };

    const handleViewHistory = () => {
        window.location.href = '/orders';
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Thanh toán thành công!</h1>
            {amount ? (
                <p>Bạn đã thanh toán số tiền: <strong>{parseInt(amount).toLocaleString('vi-VN')} VNĐ</strong></p>
            ) : (
                <p>Thông tin số tiền không khả dụng.</p>
            )}
            <p>Hóa đơn: <strong>{orderId}</strong></p> 
            <button
                onClick={handleViewHistory}
                style={{
                    padding: '10px 20px',
                    marginTop: '20px',
                    backgroundColor: '#e78926',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Xem lịch sử mua hàng
            </button>
        </div>
    );
};

export default PaymentSuccess;