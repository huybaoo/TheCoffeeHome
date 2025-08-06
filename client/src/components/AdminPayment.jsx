import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import '../css/AdminPayment.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminPayment = () => {
    const [orderList, setOrderList] = useState([]);
    const [paymentSummaryData, setPaymentSummaryData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/orders/');
                setOrderList(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy đơn hàng:', error);
                setFetchError('Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        const calculatePaymentSummary = () => {
            const summary = {
                'Thanh toán qua ngân hàng': 0,
                'Thanh toán sau khi nhận hàng': 0,
            };

            orderList.forEach(order => {
                const orderDate = new Date(order.createdAt);
                const month = orderDate.getMonth() + 1;
                const year = orderDate.getFullYear();

                // Kiểm tra trạng thái và tháng/năm
                if (order.status === "Đã giao thành công" && month === selectedMonth && year === selectedYear) {
                    if (order.method === 'Thanh toán qua ngân hàng' || order.method === 'Thanh toán sau khi nhận hàng') {
                        summary[order.method] += order.totalPrice || 0;
                    }
                }
            });

            setPaymentSummaryData(summary);
        };

        if (orderList.length > 0) {
            calculatePaymentSummary();
        }
    }, [orderList, selectedMonth, selectedYear]);

    const chartData = {
        labels: Object.keys(paymentSummaryData),
        datasets: [
            {
                label: 'Doanh thu theo phương thức thanh toán',
                data: Object.values(paymentSummaryData),
                backgroundColor: ['#FF6384', '#36A2EB'],
                borderColor: ['#FF6384', '#36A2EB'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const total = Object.values(paymentSummaryData).reduce((a, b) => a + b, 0);
                        const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${tooltipItem.raw} VND (${percentage}%)`;
                    }
                }
            }
        },
    };

    if (isLoading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    if (fetchError) {
        return <div>{fetchError}</div>;
    }

    return (
        <div className="admin-payment">
            <AdminHeader />
            <h2 className="admin-payment-title">Báo cáo doanh thu theo phương thức thanh toán</h2>
            <div className="month-year-selector">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                    {[...Array(12)].map((_, index) => (
                        <option key={index} value={index + 1}>{index + 1}</option>
                    ))}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {[...Array(5)].map((_, index) => {
                        const yearOption = new Date().getFullYear() - index;
                        return (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="admin-payment-chart-container">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default AdminPayment;