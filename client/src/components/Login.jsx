import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import '../css/Login.css';

const Login = () => {
    const [name, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/v1/customers/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password }),
            });
    
            const data = await response.json();
            if (response.ok) {
                // Lưu thông tin người dùng
                localStorage.setItem('user', JSON.stringify(data.customer)); 
    
                navigate('/'); 
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Lỗi kết nối tới server');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h3>Đăng nhập</h3>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={name} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <button type="submit">Đăng nhập</button>
                </form>
                {error && <p className="error">{error}</p>}
                <p>
                    Bạn chưa có tài khoản? <Link to="/register">Đăng ký Tại đây</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;