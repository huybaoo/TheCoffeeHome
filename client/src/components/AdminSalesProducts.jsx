import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import '../css/AdminSalesProducts.css';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const AdminSalesProducts = () => {
    const [orders, setOrders] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productSalesData, setProductSalesData] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/orders/');
                setOrders(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy đơn hàng:', error);
                setError('Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        const calculateProductSales = () => {
            const salesData = {};
            const filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === month && order.status === "Đã giao thành công"; // Kiểm tra trạng thái
            });

            if (filteredOrders.length === 0) {
                setError('Không có dữ liệu cho tháng đã chọn.');
                setProductSalesData({});
                return;
            }

            filteredOrders.forEach(order => {
                order.products.forEach(product => {
                    salesData[product.name] = (salesData[product.name] || 0) + (product.price * product.quantity);
                });
            });

            setProductSalesData(salesData);
            setError(null); // Reset error nếu có dữ liệu
        };

        calculateProductSales();
    }, [orders, year, month]);

    const pieChartData = {
        labels: Object.keys(productSalesData),
        datasets: [{
            label: 'Doanh thu theo sản phẩm',
            data: Object.values(productSalesData),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
            ],
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    padding: 10,
                    font: {
                        size: 14, 
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(2) + '%';
                        return `${context.label}: ${context.raw} VND (${percentage})`;
                    },
                },
            },
        },
    };

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="sales-products">
            <AdminHeader />
            <h2 className="sales-title">Doanh thu theo sản phẩm</h2>
            <div className="sales-select-container">
                <select id="year-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {[...Array(5)].map((_, index) => {
                        const yearOption = new Date().getFullYear() - index;
                        return (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        );
                    })}
                </select>
                <select id="month-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    {[...Array(12)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                            Tháng {index + 1}
                        </option>
                    ))}
                </select>
            </div>
            {error && <div className="sales-error-message">{error}</div>}
            <div className="chart-container">
                {Object.keys(productSalesData).length > 0 && <Pie data={pieChartData} options={options} />}
            </div>
        </div>
    );
};

export default AdminSalesProducts;