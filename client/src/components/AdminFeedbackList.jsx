import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import '../css/AdminFeedbackList.css';

const AdminFeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [replyingId, setReplyingId] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/ratings');
                setFeedbacks(res.data);
            } catch (err) {
                setError(`Không thể tải phản hồi: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    const handleReplySubmit = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/v1/ratings/${id}/reply`, {
                adminReply: replyContent,
            });
            const updatedFeedbacks = feedbacks.map(fb =>
                fb._id === id ? { ...fb, adminReply: replyContent } : fb
            );
            setFeedbacks(updatedFeedbacks);
            setReplyingId(null);
            setReplyContent('');
        } catch (err) {
            alert('Gửi phản hồi thất bại: ' + err.message);
        }
    };

    const filteredFeedbacks = feedbacks.filter(fb => {
        const matchReply = filter === 'unanswered' ? !fb.adminReply : true;
        const matchRating = ratingFilter === 'all' ? true : fb.rating === parseInt(ratingFilter);
        return matchReply && matchRating;
    });

    return (
        <div>
            <AdminHeader />
            <div className="feedback-list">
                <h2>DANH SÁCH PHẢN HỒI</h2>

                <div className="filter-bar">
                    <div className="filter-group">
                        <label>Bộ lọc phản hồi:</label>
                        <select value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="unanswered">Chưa trả lời</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Lọc theo sao:</label>
                        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                            <option value="all">Tất cả</option>
                            {[5, 4, 3, 2, 1].map(star => (
                                <option key={star} value={star}>{star} sao</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p>Đang tải...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Đánh giá</th>
                                <th>Bình luận</th>
                                <th>Phản hồi (Admin)</th>
                                <th>Ngày đánh giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.map(fb => (
                                <tr key={fb._id}>
                                    <td>{fb.userId?.Name || 'Ẩn danh'}</td>
                                    <td>{fb.rating} ⭐</td>
                                    <td>{fb.comment}</td>
                                    <td>
                                        {fb.adminReply ? (
                                            fb.adminReply
                                        ) : replyingId === fb._id ? (
                                            <div>
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Nhập phản hồi..."
                                                    rows="2"
                                                    cols="30"
                                                />
                                                <br />
                                                <button onClick={() => handleReplySubmit(fb._id)}>Gửi</button>
                                                <button onClick={() => { setReplyingId(null); setReplyContent(''); }}>Huỷ</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setReplyingId(fb._id)}>Phản hồi</button>
                                        )}
                                    </td>
                                    <td>{new Date(fb.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminFeedbackList;