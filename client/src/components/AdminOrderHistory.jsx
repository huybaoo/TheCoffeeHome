import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { faCheckCircle, faTruck, faSpinner, faHourglassHalf, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdminHeader from './AdminHeader';
import '../css/AdminOrderHistory.css'; 

const AdminOrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStatus, setCurrentStatus] = useState('Tất cả'); //trạng thái mặc định

    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 8;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/orders');
                const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const now = new Date();
                const updatedOrders = sortedOrders.map(order => {
                    if (
                        order.user?.Name === 'guest' &&
                        order.status === 'Đơn hàng đang được giao'
                    ) {
                        const createdTime = new Date(order.createdAt);
                        const diffInMinutes = (now - createdTime) / 1000 / 60;

                        if (diffInMinutes >= 30) {
                            //update trạng thái đơn
                            axios.put(`http://localhost:5000/api/v1/orders/status/${order._id}`, {
                                status: 'Đã giao thành công'
                            }).catch(error => {
                                console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
                            });

                            return { ...order, status: 'Đã giao thành công' };
                        }
                    }
                    return order;
                });

                setOrders(updatedOrders);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const [confirmAction, setConfirmAction] = useState({
        visible: false,
        action: null,
        id: null
    });

    const showConfirmDialog = (action, id) => {
        setConfirmAction({ visible: true, action, id });
    };

    const cancelAction = () => {
        setConfirmAction({ visible: false, action: null, id: null });
    };

    const confirmOrder = async () => {
        if (!confirmAction.id) return;
        try {
            await axios.put(`http://localhost:5000/api/v1/orders/confirm/${confirmAction.id}`);
            setOrders(orders.map(order => 
                order._id === confirmAction.id ? { ...order, status: 'Đã được xác nhận' } : order
            ));
            alert('Đơn hàng đã được xác nhận.');
        } catch (error) {
            console.error('Lỗi khi xác nhận đơn hàng:', error);
            alert('Có lỗi xảy ra khi xác nhận đơn hàng.');
        }
        cancelAction();
    };
    
    const deliverOrder = async () => {
        if (!confirmAction.id) return;
        try {
            await axios.put(`http://localhost:5000/api/v1/orders/delivery/${confirmAction.id}`, { status: 'Đơn hàng đang được giao' });
            setOrders(orders.map(order =>
                order._id === confirmAction.id ? { ...order, status: 'Đơn hàng đang được giao' } : order
            ));
            alert('Đơn hàng đang được giao.');
        } catch (error) {
            console.error('Lỗi khi giao hàng:', error);
            alert('Có lỗi xảy ra khi giao hàng.');
        }
        cancelAction();
    };
    
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

    // Lọc đơn hàng theo trạng thái đã chọn
    const filteredOrders = currentStatus === 'Tất cả' ? orders : orders.filter(order => order.status === currentStatus);
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Đếm số đơn hàng theo trạng thái
    const orderCounts = {
        'Tất cả': orders.length,
        'Đã được xác nhận': orders.filter(order => order.status === 'Đã được xác nhận').length,
        'Đang xử lý': orders.filter(order => order.status === 'Đang xử lý').length,
        'Chưa được xác nhận': orders.filter(order => order.status === 'Chưa được xác nhận').length,
        'Đơn hàng đang được giao': orders.filter(order => order.status === 'Đơn hàng đang được giao').length,
        'Đã giao thành công': orders.filter(order => order.status === 'Đã giao thành công').length,
    };

    const getStatusContent = (status) => {
        switch (status) {
            case 'Đã được xác nhận':
                return { className: 'status-confirmed', icon: faCheckCircle, label: status };
            case 'Đang xử lý':
                return { className: 'status-processing', icon: faSpinner, label: status };
            case 'Chưa được xác nhận':
                return { className: 'status-pending', icon: faHourglassHalf, label: status };
            case 'Đơn hàng đang được giao':
                return { className: 'status-shipping', icon: faTruck, label: status };
            case 'Đã giao thành công':
                return { className: 'status-success', icon: faCheckCircle, label: status };
            case 'Đơn hàng đã hủy':
                return { className: 'status-cancelled', icon: faTimesCircle, label: status };
            default:
                return { className: '', icon: null, label: status };
        }
    };    
    
    if (loading) return <div className="adminorders-loading">Loading...</div>;
    if (error) return <div className="adminorders-error">Error: {error}</div>;

    return (
        <div className="adminorders-container">
            <AdminHeader />
            <h1 className="adminorders-title">DANH SÁCH HÓA ĐƠN</h1>
            <div className="order-status-filter">
                <button onClick={() => setCurrentStatus('Tất cả')}>
                    Tất cả <span className="order-status-count">({orderCounts['Tất cả']})</span>
                </button>
                <button onClick={() => setCurrentStatus('Đã được xác nhận')}>
                    Đã được xác nhận <span className="order-status-count">({orderCounts['Đã được xác nhận']})</span>
                </button>
                <button onClick={() => setCurrentStatus('Đang xử lý')}>
                    Đang xử lý <span className="order-status-count">({orderCounts['Đang xử lý']})</span>
                </button>
                <button onClick={() => setCurrentStatus('Chưa được xác nhận')}>
                    Chưa được xác nhận <span className="order-status-count">({orderCounts['Chưa được xác nhận']})</span>
                </button>
                <button onClick={() => setCurrentStatus('Đơn hàng đang được giao')}>
                    Đơn hàng đang được giao <span className="order-status-count">({orderCounts['Đơn hàng đang được giao']})</span>
                </button>
                <button onClick={() => setCurrentStatus('Đã giao thành công')}>
                    Đã giao thành công <span className="order-status-count">({orderCounts['Đã giao thành công']})</span>
                </button>
            </div>

            <table className="adminorders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Tên</th>
                        <th>Địa chỉ</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền</th>
                        <th>Phương thức</th>
                        <th>Tình trạng</th>
                        <th>Thời gian đặt</th>
                        <th>Xác nhận</th>
                        <th>Giao hàng</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.user.Name}</td>
                            <td>{order.user.name}</td>
                            <td>{order.user.address}</td>
                            <td>
                                <ul>
                                    {order.products.map(product => (
                                        <li key={product.productId}>
                                            {product.name} (x{product.quantity}) - Ghi chú: {product.note}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>{order.totalPrice.toLocaleString()} VND</td>
                            <td>{order.method}</td>
                            <td>
                                {(() => {
                                    const { className, icon, label } = getStatusContent(order.status);
                                    return (
                                        <span className={`order-status ${className}`}>
                                            {icon && <FontAwesomeIcon icon={icon} />} {label}
                                        </span>
                                    );
                                })()}
                            </td>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                            <td>
                                {order.status === 'Chưa được xác nhận' && (
                                    <button className="icon-button confirm" onClick={() => showConfirmDialog('confirmOrder', order._id)}>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                    </button>
                                )}
                            </td>
                            <td>
                                {order.status === 'Đã được xác nhận' && (
                                    <button className="icon-button delivery" onClick={() => showConfirmDialog('deliverOrder', order._id)}>
                                        <FontAwesomeIcon icon={faTruck} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {confirmAction.visible && (
                <div className="confirm-dialog">
                    {confirmAction.action === 'confirmOrder' && <p>Bạn có chắc chắn muốn xác nhận đơn hàng này không?</p>}
                    {confirmAction.action === 'deliverOrder' && <p>Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "Đang giao" không?</p>}
                    
                    <button onClick={confirmAction.action === 'confirmOrder' ? confirmOrder : deliverOrder}>Có</button>
                    <button onClick={cancelAction}>Không</button>
                </div>
            )}

            {/* Phân trang */}
            <div className="pagination">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    Trước
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button 
                        key={index + 1} 
                        onClick={() => setCurrentPage(index + 1)} 
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Sau
                </button>
            </div>
        </div>
    );
};

export default AdminOrderHistory;