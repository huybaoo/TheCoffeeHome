import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Chatbox.css';

const Chatbox = ({ currentUser }) => {
    const [questions, setQuestions] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [isChatVisible, setIsChatVisible] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/chatbox/questions');
                setQuestions(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy câu hỏi:", error);
            }
        };

        const fetchUserQuestions = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/chatbox/user-questions/${currentUser._id}`);
                const chatData = response.data.map(q => ({
                    user: q.question,
                    reply: q.reply || null
                }));
                setChat(chatData);
            } catch (error) {
                console.error("Lỗi khi lấy câu hỏi của người dùng:", error);
            }
        };

        fetchQuestions();
        fetchUserQuestions();
    }, [currentUser]);

    const handleSendMessage = async () => {
        if (!userMessage.trim()) return;

        try {
            const messageToSend = userMessage; // Lưu lại nội dung tin nhắn
            setUserMessage(''); // Xóa ngay lập tức để tránh gửi lặp

            const userChatMessage = { user: messageToSend, reply: null };
            setChat(prevChat => [...prevChat, userChatMessage]);

            const response = await axios.post('http://localhost:5000/api/v1/chatbox/chat', { 
                message: messageToSend,
                userId: currentUser._id
            });

            const botReply = response.data.reply;

            setChat(prevChat => [
                ...prevChat.slice(0, -1),
                { user: messageToSend, reply: botReply }
            ]);

            if (!botReply) {
                await axios.post('http://localhost:5000/api/v1/chatbox/ask', {
                    userId: currentUser._id,
                    question: messageToSend
                });
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        }
    };

    const toggleChat = () => {
        setIsChatVisible(!isChatVisible);
    };

    return (
        <div>
            <button className="chat-toggle" onClick={toggleChat}>
                {isChatVisible ? "❌" : "💬"}
            </button>
            {isChatVisible && (
                <div className="chatbox">
                    <div className="chat-header">
                        <span></span>
                        <button className="close-chat" onClick={toggleChat}>✖</button>
                    </div>

                    <div className="chat-window">
                        {chat.map((msg, index) => (
                            <div key={index} className="chat-group">
                                <div className="user-message">{msg.user}</div>
                                {msg.reply && <div className="bot-message">{msg.reply}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="input-container">
                        <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button onClick={handleSendMessage}>Gửi</button>
                    </div>

                    <div className="sample-questions">
                        <h3>Mọi người cũng hay hỏi</h3>
                        {questions.map((q, index) => (
                            <button key={index} className="sample-question" onClick={() => setUserMessage(q.question)}>
                                {q.question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbox;
