import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const admin = JSON.parse(localStorage.getItem('admin')); 
    console.log('Dữ liệu admin:', admin); 

    // Kiểm tra xem admin có tồn tại và có thông tin hợp lệ không
    if (!admin) {
        console.log('Chuyển hướng đến /admin/login vì admin không tồn tại hoặc không hợp lệ.');
        return <Navigate to="/admin/login" />;
    }

    return children; // Nếu đã đăng nhập, hiển thị component con
};

export default ProtectedRoute;