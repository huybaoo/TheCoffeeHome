import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import { useLocation } from 'react-router-dom';
import '../css/AdminSales.css';
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

const AdminSales = () => {
    const [orders, setOrders] = useState([]);
    const [monthlyLabels, setMonthlyLabels] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [dailyLabels, setDailyLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [dailySales, setDailySales] = useState([]);
    const [totalDailyRevenue, setTotalDailyRevenue] = useState(0);
    const [activeTab, setActiveTab] = useState('chart'); 
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Năm hiện tại
    const location = useLocation();
    const view = new URLSearchParams(location.search).get('view');

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/orders/');
                const fetchedOrders = response.data;
                setOrders(fetchedOrders);

                const confirmedOrders = fetchedOrders.filter(order => order.status === "Đã giao thành công");

                const salesByMonth = {};
                const salesByDay = {};

                confirmedOrders.forEach(order => {
                    const date = new Date(order.createdAt);
                    const month = date.toLocaleString('default', { month: 'long' });
                    const year = date.getFullYear();

                    if (year === selectedYear) {
                        salesByMonth[month] = (salesByMonth[month] || 0) + order.totalPrice;
                    }
                    const day = date.toLocaleDateString();
                    salesByDay[day] = (salesByDay[day] || 0) + order.totalPrice;
                });

                setMonthlyLabels(Object.keys(salesByMonth));
                setMonthlyData(Object.values(salesByMonth));
                setDailyLabels(Object.keys(salesByDay));
            } catch (error) {
                console.error('Error fetching sales data:', error);
                setError('Could not retrieve sales data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, [selectedYear]); 

    const handleCheckDailySales = () => {
        const ordersOnSelectedDate = orders.filter(order =>
            new Date(order.createdAt).toLocaleDateString() === selectedDate
        );
        const totalRevenue = ordersOnSelectedDate.reduce((sum, order) => sum + order.totalPrice, 0);

        setDailySales(ordersOnSelectedDate);
        setTotalDailyRevenue(totalRevenue);
    };

    const monthlyChartData = {
        labels: monthlyLabels.length ? monthlyLabels : ['No Data'],
        datasets: [
            {
                label: 'Doanh thu theo tháng',
                data: monthlyData.length ? monthlyData : [0],
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    const selectedDailyChartData = {
        labels: dailySales.map(order => order.user.Name),
        datasets: [
            {
                label: 'Doanh thu cho ngày đã chọn',
                data: dailySales.map(order => order.totalPrice),
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return <div>Loading data...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="sales">
            <AdminHeader />
            <h2 className="title">
                {view === 'monthly' ? 'Doanh thu theo tháng' : 'Doanh thu theo ngày'}
            </h2>
            <div className="select-container">
    {view === 'monthly' && (
        <div className="year-select-container">
            <label htmlFor="year-select">Chọn năm:</label>
            <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
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
    )}
    {view === 'daily' && (
        <>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                <option value="">Chọn ngày</option>
                {dailyLabels.map(label => (
                    <option key={label} value={label}>{label}</option>
                ))}
            </select>
            <button onClick={handleCheckDailySales}>Kiểm tra</button>
        </>
    )}
</div>

            {view === 'monthly' ? (
                <div className="chart-container">
                    <Bar data={monthlyChartData} options={options} />
                </div>
            ) : (
                <div>
                    <div className="tabs">
                        <button onClick={() => setActiveTab('chart')} className={activeTab === 'chart' ? 'active' : ''}>
                            Biểu đồ Doanh thu
                        </button>
                        <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? 'active' : ''}>
                            Chi tiết Sản phẩm
                        </button>
                    </div>

                    <div className="chart-container">
                        {activeTab === 'chart' ? (
                            <Bar data={selectedDailyChartData} options={options} />
                        ) : (
                            <div className="revenue-summary">
                                {totalDailyRevenue > 0 ? (
                                    <>
                                        <h3>Tổng doanh thu cho ngày {selectedDate}: {totalDailyRevenue} VND</h3>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Người mua</th>
                                                    <th>Giá</th>
                                                    <th>Sản phẩm</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dailySales.map((order, index) => (
                                                    <tr key={index}>
                                                        <td>{order.user.Name}</td>
                                                        <td>{order.totalPrice} VND</td>
                                                        <td>{order.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                ) : (
                                    <p>Không có doanh thu cho ngày này.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSales;