import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import '../css/AdminCustomerList.css';

const AdminUnansweredQuestions = () => {
    const [unansweredQuestions, setUnansweredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reply, setReply] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        const fetchUnansweredQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/admin/unanswered-questions');
                setUnansweredQuestions(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUnansweredQuestions();
    }, []);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8081');

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setUnansweredQuestions(prevQuestions => 
                prevQuestions.map(q => 
                    q._id === data.questionId ? { ...q, reply: data.reply, answeredAt: new Date() } : q
                )
            );
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.current.close();
        };
    }, []);

    const handleReply = async (questionId) => {
        try {
            const response = await axios.post('http://localhost:5000/api/v1/admin/reply', {
                questionId: questionId,
                reply: reply
            });

            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ questionId, reply }));
            }

            console.log(response.data.message);
            setReply('');
            setUnansweredQuestions(unansweredQuestions.map(q => 
                q._id === questionId ? { ...q, reply, answeredAt: new Date() } : q
            ));
        } catch (error) {
            console.error("Lỗi khi gửi câu trả lời:", error);
        }
    };

    if (loading) return <div className="admincustomers-loading">Loading...</div>;
    if (error) return <div className="admincustomers-error">Error: {error}</div>;

    return (
        <div className="admincustomers-container">
            <AdminHeader />
            <h1 className="admincustomers-title">Câu Hỏi Chưa Trả Lời</h1>
            <ul>
                {unansweredQuestions.map(question => (
                    <li key={question._id}>
                        <p><strong>{question.userId.Name}</strong> ({question.userId.Email}): {question.question}</p>
                        {question.reply && <p><strong>Câu trả lời:</strong> {question.reply}</p>}
                        <input
                            type="text"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Nhập câu trả lời..."
                        />
                        <button onClick={() => handleReply(question._id)}>Gửi câu trả lời</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminUnansweredQuestions;
