import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import '../css/AdminCustomerList.css'; 

const AdminCustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Thêm trạng thái phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(10); 

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/customers');
                setCustomers(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    //phân trang
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(customers.length / customersPerPage);

    if (loading) return <div className="admincustomers-loading">Loading...</div>;
    if (error) return <div className="admincustomers-error">Error: {error}</div>;

    return (
        <div className="admincustomers-container">
            <AdminHeader />
            <h1 className="admincustomers-title">DANH SÁCH NGƯỜI DÙNG</h1>
            <table className="admincustomers-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Điện thoại</th>
                        <th>Địa chỉ</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCustomers.map(customer => (
                        <tr key={customer._id}>
                            <td>{customer._id}</td>
                            <td>{customer.Name}</td>
                            <td>{customer.Email}</td>
                            <td>{customer.Phone}</td>
                            <td>{customer.Address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button 
                        key={index + 1} 
                        onClick={() => setCurrentPage(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminCustomerList;