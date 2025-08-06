import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';
import '../css/OrderHistory.css';
import mongoose from 'mongoose';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); //ds đơn hàng đã lọc
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(4);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.Name;
    const userId = user?._id;
    const [guestPhone, setGuestPhone] = useState('');


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/orders/name/${userName}`);
                const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders); //tạo ds đã lọc
                setLoading(false);

                const ratingsPromises = sortedOrders.map(order =>
                    axios.get(`http://localhost:5000/api/v1/ratings/order-ratings/${order._id}/${userId}`)
                );

                const ratingsResponses = await Promise.all(ratingsPromises);
                const allRatings = ratingsResponses.flatMap(res => res.data);
                setRatings(allRatings);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
                alert("Lỗi khi lấy danh sách đơn hàng: " + error.message);
                setLoading(false);
            }
        };

        if (userName) {
            fetchOrders(); 
        }
    }, [userName, navigate, userId]);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleCancelOrder = async (orderId, products) => {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            alert('ID đơn hàng không hợp lệ.');
            return;
        }

        const order = orders.find(order => order._id === orderId);
        
        if (order.status !== 'Chưa được xác nhận') {
            alert('Chỉ có thể hủy đơn hàng chưa được xác nhận.');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/v1/orders/${orderId}`, { status: 'Đơn hàng đã hủy' });
            await Promise.all(products.map(product => {
                return axios.put(`http://localhost:5000/api/v1/product/${product.productId}`, {
                    stock: product.quantity
                });
            }));

            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId ? { ...order, status: 'Đơn hàng đã hủy' } : order
                )
            );

            // Cập nhật danh sách đã lọc
            setFilteredOrders(prevFiltered => 
                prevFiltered.map(order => 
                    order._id === orderId ? { ...order, status: 'Đơn hàng đã hủy' } : order
                )
            );

            alert('Đơn hàng đã được hủy thành công.');
        } catch {
            alert('Đơn hàng đã được hủy thành công.');
        }
    };

    const handleOrderReceived = async (orderId) => {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            alert('ID đơn hàng không hợp lệ.');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/v1/orders/received/${orderId}`, { status: 'Đã giao thành công' });
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId ? { ...order, status: 'Đã giao thành công' } : order
                )
            );
            // Cập nhật danh sách đã lọc
            setFilteredOrders(prevFiltered =>
                prevFiltered.map(order =>
                    order._id === orderId ? { ...order, status: 'Đã giao thành công' } : order
                )
            );
            alert('Đơn hàng đã được xác nhận là đã giao thành công.');
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
        }
    };

    // Hàm phân loại đơn hàng
    const handleFilterOrders = (status) => {
        if (status === 'Tất cả') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === status));
        }
        setCurrentPage(1); 
    };

    if (!userName) {
        return (
            <div className="order-history">
                <Header />
                <Menu />
                <h1 className="order-history__title">Tra cứu đơn hàng</h1>
                <div className="guest-order-form">
                    <label>Số điện thoại:</label>
                    <input
                        type="text"
                        value={guestPhone}
                        onChange={(e) => {
                            console.log("SĐT đang nhập:", e.target.value);
                            setGuestPhone(e.target.value);
                        }}
                        placeholder="Nhập số điện thoại"
                    />
                    <button onClick={async () => {
                        if (!guestPhone) {
                            alert("Vui lòng nhập số điện thoại.");
                            return;
                        }
                        setLoading(true);
                        try {
                            const response = await axios.get(`http://localhost:5000/api/v1/orders/phone/${guestPhone}`);
                            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            setOrders(sortedOrders);
                            setFilteredOrders(sortedOrders);
                            setLoading(false);
                        } catch (error) {
                            alert("Không tìm thấy đơn hàng với số điện thoại này.");
                            setLoading(false);
                        }
                    }}>
                        Tra cứu
                    </button>
                </div>
    
                {filteredOrders.length === 0 ? (
                    <p className="order-history__empty">Không có đơn hàng nào.</p>
                ) : (
                    <ul className="order-history__list">
                        {filteredOrders.map(order => (
                            <li key={order._id} className="order-history__item">
                                <h3 className="order-history__order-id">Đơn hàng ID: {order._id}</h3>
                                <p className="order-history__name">Tên: {order.user.name}</p>
                                <p className="order-history__name">Địa chỉ: {order.user.address}</p>
                                <p className="order-history__phone">Số điện thoại: {order.user.phone}</p>
                                <p className="order-history__total-price">Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ</p>
                                <p className="order-history__status">Phương thức: {order.method}</p>
                                <p className="order-history__status">Tình trạng: {order.status}</p>
                                <p className="order-history__date">Ngày đặt: {new Date(order.createdAt).toLocaleString()}</p>
                                <h4 className="order-history__product-title">Chi tiết sản phẩm:</h4>
                                <ul className="order-history__product-list">
                                    {order.products.map(product => (
                                        <li key={product.productId} className="order-history__product-item">
                                            {product.name} - {product.quantity} x {product.price.toLocaleString("vi-VN")} VNĐ
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
    
    

    if (loading) return <div>Loading...</div>;

    return (
        <div className="order-history">
            <Header />
            <Menu />
            <h1 className="order-history__title">Lịch sử mua hàng</h1>
            <div className="order-status-filter">
                <button onClick={() => handleFilterOrders('Tất cả')}>
                    Tất cả <span className="order-status-count">({orders.length})</span>
                </button>
                <button onClick={() => handleFilterOrders('Chưa được xác nhận')}>
                    Chưa được xác nhận <span className="order-status-count">({orders.filter(order => order.status === 'Chưa được xác nhận').length})</span>
                </button>
                <button onClick={() => handleFilterOrders('Đơn hàng đang được giao')}>
                    Đơn hàng đang được giao <span className="order-status-count">({orders.filter(order => order.status === 'Đơn hàng đang được giao').length})</span>
                </button>
                <button onClick={() => handleFilterOrders('Đã giao thành công')}>
                    Đã giao thành công <span className="order-status-count">({orders.filter(order => order.status === 'Đã giao thành công').length})</span>
                </button>
                <button onClick={() => handleFilterOrders('Đơn hàng đã hủy')}>
                    Đơn hàng đã hủy <span className="order-status-count">({orders.filter(order => order.status === 'Đơn hàng đã hủy').length})</span>
                </button>
            </div>
            {filteredOrders.length === 0 ? (
                <p className="order-history__empty">Không có đơn hàng nào.</p>
            ) : (
                <ul className="order-history__list">
                    {currentOrders.map(order => (
                        <li key={order._id} className="order-history__item">
                            <h3 className="order-history__order-id">Đơn hàng ID: {order._id}</h3>
                            <p className="order-history__name">Tên: {order.user.name}</p>
                            <p className="order-history__name">Địa chỉ: {order.user.address}</p>
                            <p className="order-history__phone">Số điện thoại: {order.user.phone}</p>
                            <p className="order-history__total-price">Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VNĐ</p>
                            <p className="order-history__status">Phương thức: {order.method}</p>
                            <p className="order-history__status">Tình trạng: {order.status}</p>
                            <p className="order-history__date">Ngày đặt: {new Date(order.createdAt).toLocaleString()}</p>
                            <h4 className="order-history__product-title">Chi tiết sản phẩm:</h4>
                            <ul className="order-history__product-list">
                            {order.products.map(product => (
                                <li key={product.productId} className="order-history__product-item">
                                    {product.name} - {product.quantity} x {product.price.toLocaleString("vi-VN")} VNĐ
                                    {order.status === 'Đã giao thành công' && 
                                        !ratings.some(rating => rating.orderId === order._id) && (
                                        <button 
                                            className="order-history__cancel-button" 
                                            onClick={() => {
                                                navigate(`/rate-order/${order._id}/${product.productId._id}`); 
                                            }}
                                        >
                                            Đánh giá
                                        </button>
                                    )}
                                </li>
                            ))}
                            </ul>
                            {order.status === 'Chưa được xác nhận' && (
                                <button className="order-history__cancel-button" onClick={() => handleCancelOrder(order._id, order.products)}>
                                    Hủy đơn hàng
                                </button>
                            )}
                            {order.status === 'Đơn hàng đang được giao' && (
                                <button 
                                    className="order-history__cancel-button" 
                                    onClick={() => handleOrderReceived(order._id)}
                                >
                                    Đã nhận được hàng
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <div className="pl-pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button 
                        key={index + 1} 
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;