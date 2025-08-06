import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminHeader.css';

const AdminHeader = ({ onLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const location = useLocation(); 

    const toggleDropdown = (e) => {
        e.preventDefault();
        setShowDropdown(prev => !prev);
    };

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/admin/unanswered-questions');
                setUnreadMessages(response.data.count || 0);
            } catch (error) {
                console.error("Lỗi khi lấy số tin nhắn chưa trả lời:", error);
            }
        };

        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="admin-header">
            <nav className="linkadminheader">
                <Link className={`header-link ${location.pathname === "/admin" ? "active" : ""}`} to="/admin">TRANG CHỦ</Link>
                <Link className={`header-link ${location.pathname === "/admin/admincategory" ? "active" : ""}`} to="/admin/admincategory">Loại Sản Phẩm</Link>
                <Link className={`header-link ${location.pathname === "/admin/adminproductlist" ? "active" : ""}`} to="/admin/adminproductlist">Sản Phẩm</Link>
                <Link className={`header-link ${location.pathname === "/admin/admincustomerlist" ? "active" : ""}`} to="/admin/admincustomerlist">Khách Hàng</Link>
                <Link className={`header-link ${location.pathname === "/admin/adminorderhistory" ? "active" : ""}`} to="/admin/adminorderhistory">Đơn Hàng</Link>
                <Link className={`header-link ${location.pathname === "/admin/feedback" ? "active" : ""}`} to="/admin/feedback"> Phản hồi </Link>
                <Link className={`header-link ${location.pathname === "/admin/chat" ? "active" : ""}`} to="/admin/chat">
                    Tin nhắn {unreadMessages > 0 && <span className="message-badge">{unreadMessages}</span>}
                </Link>

                <a className="header-link" onClick={toggleDropdown} href="#!">Doanh Thu</a>
                {showDropdown && (
                    <ul className="dropdown-menu">
                        <li><Link className={`header-link ${location.search.includes("view=monthly") ? "active" : ""}`} to="/admin/adminSales?view=monthly">Tháng</Link></li>
                        <li><Link className={`header-link ${location.search.includes("view=daily") ? "active" : ""}`} to="/admin/adminSales?view=daily">Ngày</Link></li>
                        <li><Link className={`header-link ${location.pathname === "/admin/adminSalesProducts" ? "active" : ""}`} to="/admin/adminSalesProducts">Sản Phẩm</Link></li>
                        <li><Link className={`header-link ${location.pathname === "/admin/adminPayment" ? "active" : ""}`} to="/admin/adminPayment">Phương thức thanh toán</Link></li>
                    </ul>
                )}
                <Link className={`header-link ${location.pathname === "/admin/admindiscount" ? "active" : ""}`} to="/admin/admindiscount">Mã giảm giá</Link>
            </nav>
            <button onClick={onLogout} className="logout-button">Đăng xuất</button>
        </header>
    );
};

export default AdminHeader;
