import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import mongoose from 'mongoose';

import Header from '../components/Header';
import Menu from '../components/Menu';
import '../css/RateOrder.css';

const RateOrder = () => {
    const { orderId, productId } = useParams();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    console.log('Order ID:', orderId); 
    console.log('Product ID:', productId); 

    const submitRating = async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) {
            alert('Bạn cần đăng nhập để gửi đánh giá.');
            return;
        }
        const userId = user._id;

        if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
            alert('ID đơn hàng hoặc sản phẩm không hợp lệ.');
            return;
        }

        const ratingData = {
            orderId,
            productId,
            rating,
            comment,
            userId,
        };

        try {
            await axios.post('http://localhost:5000/api/v1/ratings/rate-order', ratingData);
            setMessage('Đánh giá thành công!');
        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra.';
            setMessage(errorMessage);
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="rate-order">
            <Header />
            <Menu />
            <h2>Đánh giá sản phẩm</h2>
            <form onSubmit={submitRating}>
                <label>Đánh giá:</label>
                <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'gray' }}>
                            ★
                        </span>
                    ))}
                </div>
                <label>Nhận xét:</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
                <button type="submit" className="rate-order__submit-button">Gửi đánh giá</button>
            </form>
            {message && <div className="notification">{message}</div>}
            <button onClick={() => navigate('/orders')} className="rate-order__back-button">
                Quay lại trang lịch sử mua hàng
            </button>
        </div>
    );
};

export default RateOrder;