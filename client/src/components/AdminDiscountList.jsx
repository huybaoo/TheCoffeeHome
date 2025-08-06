import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../css/AdminDiscountList.css'; 
import AdminHeader from './AdminHeader';

const AdminDiscountList = () => {
    const [discountCodes, setDiscountCodes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newDiscount, setNewDiscount] = useState({
        codename: '',
        percent: '',
        description: '',
        status: 'Kích hoạt', 
    });
    const [editDiscountId, setEditDiscountId] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ visible: false, action: null, id: null });
    const [message, setMessage] = useState('');
    const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const discountsPerPage = 5;

    useEffect(() => {
        const fetchDiscountCodes = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/discountcode');
                setDiscountCodes(res.data);
            } catch (err) {
                setError(`Không thể tải danh sách mã giảm giá: ${err.response ? err.response.data.message : err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscountCodes();
    }, []);

    const handleAddDiscount = () => {
        setIsAddingOrEditing(true);
        setNewDiscount({ codename: '', percent: '', description: '', status: 'Kích hoạt' });
    };

    const handleEditDiscount = (discount) => {
        setIsAddingOrEditing(true);
        setEditDiscountId(discount._id);
        setNewDiscount(discount); // Lấy thông tin mã giảm giá để chỉnh sửa
    };

    const confirmAddDiscount = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/v1/discountcode', {
                ...newDiscount,
                percent: Number(newDiscount.percent),
            });
            setDiscountCodes([...discountCodes, res.data]);
            setMessage('Thêm mã giảm giá thành công!');
            resetForm();
        } catch (err) {
            setError(`Lỗi khi thêm mã giảm giá: ${err.response ? err.response.data.message : err.message}`);
        }
    };

    const confirmEditDiscount = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/v1/discountcode/${editDiscountId}`, {
                ...newDiscount,
                percent: Number(newDiscount.percent), // giữ phần trăm là số
            });
            setDiscountCodes(discountCodes.map(discount => (discount._id === editDiscountId ? res.data : discount)));
            setMessage('Sửa mã giảm giá thành công!');
            resetForm();
        } catch (err) {
            setError(`Lỗi khi sửa mã giảm giá: ${err.response ? err.response.data.message : err.message}`);
        }
    };

    const handleDeleteDiscount = (id) => {
        setConfirmAction({ visible: true, action: 'delete', id });
    };

    const confirmDeleteDiscount = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/v1/discountcode/${confirmAction.id}`);
            setDiscountCodes(discountCodes.filter(discount => discount._id !== confirmAction.id));
            setMessage('Xóa mã giảm giá thành công!');
            setConfirmAction({ visible: false, action: null, id: null });
        } catch (err) {
            setError(`Lỗi khi xóa mã giảm giá: ${err.response ? err.response.data.message : err.message}`);
        }
    };

    const cancelAction = () => {
        setConfirmAction({ visible: false, action: null, id: null });
    };

    const handleInputChange = (e) => {
        setNewDiscount({ ...newDiscount, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setEditDiscountId(null);
        setNewDiscount({ codename: '', percent: '', description: '', status: 'Kích hoạt' });
        setIsAddingOrEditing(false);
        setConfirmAction({ visible: false, action: null, id: null });
    };

    const indexOfLastDiscount = currentPage * discountsPerPage;
    const indexOfFirstDiscount = indexOfLastDiscount - discountsPerPage;
    const currentDiscounts = discountCodes.slice(indexOfFirstDiscount, indexOfLastDiscount);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const totalPages = Math.ceil(discountCodes.length / discountsPerPage);
    
    return (
        <div>
            <AdminHeader />
            <div className="discount-list">
                {message && <div className="alert">{message}</div>}
                <h2>DANH SÁCH MÃ GIẢM GIÁ</h2>
                <button onClick={handleAddDiscount}>Thêm mã giảm giá</button>
                {isAddingOrEditing && (
                    <div className="add-discount">
                        <input
                            type="text"
                            name="codename"
                            value={newDiscount.codename}
                            onChange={handleInputChange}
                            placeholder="Tên mã giảm giá"
                        />
                        <input
                            type="number"
                            name="percent"
                            value={newDiscount.percent}
                            onChange={handleInputChange}
                            placeholder="Phần trăm giảm giá"
                        />
                        <input
                            type="text"
                            name="description"
                            value={newDiscount.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả"
                        />
                        <select
                            name="status"
                            value={newDiscount.status}
                            onChange={handleInputChange}
                        >
                            <option value="Kích hoạt">Kích hoạt</option>
                            <option value="Vô hiệu hóa">Vô hiệu hóa</option>
                        </select>
                        <button onClick={() => {
                            if (editDiscountId) {
                                setConfirmAction({ visible: true, action: 'confirmEdit' });
                            } else {
                                setConfirmAction({ visible: true, action: 'confirmAdd' });
                            }
                        }}>
                            {editDiscountId ? 'Cập nhật' : 'Thêm'}
                        </button>
                        {editDiscountId && <button className="cancleb" onClick={resetForm}>Hủy</button>}
                    </div>
                )}
                <table className="discount-table">
                    <thead>
                        <tr>
                            <th>Tên mã giảm giá</th>
                            <th>Phần trăm</th>
                            <th>Mô tả</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDiscounts.map(discount => (
                            <tr key={discount._id}>
                                <td>{discount.codename}</td>
                                <td>{discount.percent}%</td>
                                <td>{discount.description}</td>
                                <td>{discount.status}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditDiscount(discount)}>
                                        <FaEdit /> 
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDeleteDiscount(discount._id)}>
                                        <FaTrash /> 
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {confirmAction.visible && (
                    <div className="confirm-dialog">
                        {confirmAction.action === 'delete' && <p>Bạn có chắc chắn muốn xóa mã giảm giá này?</p>}
                        {confirmAction.action === 'confirmAdd' && <p>Bạn có chắc chắn muốn thêm mã giảm giá "{newDiscount.codename}" không?</p>}
                        {confirmAction.action === 'confirmEdit' && <p>Bạn có chắc chắn muốn sửa mã giảm giá thành "{newDiscount.codename}" không?</p>}
                        <button onClick={confirmAction.action === 'delete' ? confirmDeleteDiscount : confirmAction.action === 'confirmAdd' ? confirmAddDiscount : confirmEditDiscount}>
                            Có
                        </button>
                        <button onClick={cancelAction}>Không</button>
                    </div>
                )}
                <div className="pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDiscountList;