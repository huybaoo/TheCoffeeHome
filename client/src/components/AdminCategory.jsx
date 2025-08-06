import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../css/AdminCategory.css';
import AdminHeader from './AdminHeader';

const AdminCategory = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [confirmAction, setConfirmAction] = useState({ visible: false, action: null, id: null, name: "" });
    
    // Thêm trạng thái phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(8); // Số loại sản phẩm trên mỗi trang

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/categories/');
                setCategories(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = () => {
        if (newCategory.trim() === "") {
            alert("Vui lòng nhập tên loại.");
            return;
        }
        setConfirmAction({ visible: true, action: 'add', name: newCategory });
    };

    const confirmAddCategory = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/v1/categories/', { Type: newCategory });
            setCategories([...categories, res.data]);
            setNewCategory("");
            setConfirmAction({ visible: false, action: null, id: null, name: "" });
        } catch (err) {
            setError(err.message);
        }
    };

    const confirmEditCategory = async () => {
        if (editCategoryName.trim() === "") {
            alert("Vui lòng nhập tên loại.");
            return;
        }
        try {
            if (!editCategoryId) {
                alert("ID không hợp lệ.");
                return;
            }
            const res = await axios.put(`http://localhost:5000/api/v1/categories/${editCategoryId}`, { Type: editCategoryName });
            setCategories(categories.map(cat => (cat._id === editCategoryId ? res.data : cat)));
            setEditCategoryId(null);
            setEditCategoryName("");
            setConfirmAction({ visible: false, action: null, id: null, name: "" });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = (id) => {
        setConfirmAction({ visible: true, action: 'delete', id });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/v1/categories/${confirmAction.id}`);
            setCategories(categories.filter(cat => cat._id !== confirmAction.id));
            setConfirmAction({ visible: false, action: null, id: null, name: "" });
        } catch (err) {
            setError(err.message);
        }
    };

    const cancelAction = () => {
        setConfirmAction({ visible: false, action: null, id: null, name: "" });
    };

    // phân trang
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(categories.length / categoriesPerPage);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <AdminHeader />
            <div className="category-list">
                <h2>DANH SÁCH LOẠI SẢN PHẨM</h2>
                <div className="add-category">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Thêm category mới"
                    />
                    <button onClick={handleAddCategory} className="add-button">
                        <FontAwesomeIcon icon={faPlus} /> Thêm
                    </button>
                </div>
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>Loại sản phẩm</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCategories.map((category) => (
                            <tr key={category._id} className="category-item">
                                <td>
                                    {editCategoryId === category._id ? (
                                        <input
                                            type="text"
                                            value={editCategoryName}
                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                        />
                                    ) : (
                                        <h4>{category.Type}</h4>
                                    )}
                                </td>
                                <td className="button-group">
                                    {editCategoryId === category._id ? (
                                        <>
                                            <button className="save-button" onClick={confirmEditCategory}>
                                                <FontAwesomeIcon icon={faSave} />
                                            </button>
                                            <button className="cancel-button" onClick={() => {
                                                setEditCategoryId(null);
                                                setEditCategoryName('');
                                            }}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="edit-button" onClick={() => {
                                                setEditCategoryId(category._id);
                                                setEditCategoryName(category.Type);
                                            }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className="delete-button" onClick={() => handleDeleteCategory(category._id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </>
                                    )}
                                </td>
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

            {confirmAction.visible && (
                <div className="confirm-dialog">
                    <p>Bạn có chắc muốn {confirmAction.action === 'delete' ? 'xóa' : 'thêm'} loại "{confirmAction.name}" không?</p>
                    <button onClick={confirmAction.action === 'delete' ? confirmDelete : confirmAddCategory}>Xác nhận</button>
                    <button onClick={cancelAction}>Hủy</button>
                </div>
            )}
        </div>
    );
};

export default AdminCategory;