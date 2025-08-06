import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import '../css/AdminHome.css';

const AdminHome = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin'); 
        navigate('/admin/login'); 
    };

    return (
        <div>
            <AdminHeader onLogout={handleLogout} />
            <div className="adminhome-content">
                <h1 className="adminhomeh1">TRANG QUẢN TRỊ THE COFFEE HOME</h1>
            </div>
        </div>
    );
};

export default AdminHome;