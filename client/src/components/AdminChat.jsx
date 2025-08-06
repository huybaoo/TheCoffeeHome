import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import '../css/AdminChat.css';

const AdminChat = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [reply, setReply] = useState('');

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/v1/admin/chats");

                if (!Array.isArray(response.data)) {
                    console.error("Dữ liệu trả về không phải mảng!");
                    return;
                }

                const processedChats = response.data.reduce((acc, chat) => {
                    if (!chat.userId || !chat.userId._id) return acc;

                    const userId = chat.userId._id;
                    const existingChat = acc.find(c => c.user._id === userId);

                    const newMessage = [
                        { 
                            _id: chat._id, 
                            sender: 'user', 
                            text: chat.question, 
                            createdAt: chat.createdAt // Giữ đúng thời gian tạo
                        },
                        chat.reply ? { 
                            sender: 'admin', 
                            text: chat.reply, 
                            createdAt: chat.answeredAt // Dùng thời gian trả lời nếu có
                        } : null
                    ].filter(Boolean);

                    if (existingChat) {
                        existingChat.messages.push(...newMessage);
                    } else {
                        acc.push({
                            user: {
                                _id: userId,
                                Name: chat.userId.Name || "Unknown User",
                                Email: chat.userId.Email || "No Email"
                            },
                            messages: newMessage
                        });
                    }

                    return acc;
                }, []);

                setChats(processedChats);
            } catch (error) {
                console.error("Lỗi khi fetch chats:", error);
            }
        };

        fetchChats();
    }, []);

    // Hàm gửi trả lời
    const handleReply = async () => {
        if (!selectedChat || !selectedMessage || !reply.trim()) return;

        try {
            await axios.post('http://localhost:5000/api/v1/admin/reply', {
                questionId: selectedMessage._id,
                reply: reply
            });

            const updatedChats = chats.map(chat => {
                if (chat.user._id === selectedChat.user._id) {
                    return {
                        ...chat,
                        messages: chat.messages.map(msg =>
                            msg._id === selectedMessage._id
                                ? { ...msg, reply: reply } 
                                : msg
                        )
                    };
                }
                return chat;
            });

            setChats(updatedChats);
            setReply('');
            setSelectedMessage(null);
        } catch (error) {
            console.error("Lỗi khi gửi câu trả lời:", error);
        }
    };

    const convertToVietnamTime = (isoString) => {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    };

    return (
        <div className="adminchat-container">
            <AdminHeader />
            <h1 className="adminchat-title">Quản Lý Tin Nhắn</h1>
            <div className="adminchat-content">
                <div className="chat-list">
                    {chats.length > 0 ? (
                        chats.map(chat => (
                            <div
                                key={chat.user._id}
                                className={`chat-item ${selectedChat?.user._id === chat.user._id ? 'selected' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <p><strong>{chat.user.Name}</strong> ({chat.user.Email})</p>
                            </div>
                        ))
                    ) : (
                        <p>Không có đoạn chat nào.</p>
                    )}
                </div>

                <div className="chat-window-admin">
                    {selectedChat ? (
                        <>
                            <h2>Đoạn chat với {selectedChat.user.Name}</h2>
                            <div className="messages">
                                {selectedChat.messages.length > 0 ? (
                                    selectedChat.messages.map((msg, index) => (
                                        <div 
                                            key={index} 
                                            className={`message ${msg.sender === 'admin' ? 'admin-msg' : 'user-msg'} ${selectedMessage?._id === msg._id ? 'selected-message' : ''}`}
                                            onClick={() => setSelectedMessage(msg)}
                                        >
                                            <strong>{msg.sender === 'admin' ? 'Admin' : selectedChat.user.Name}:</strong>
                                            <p>{msg.text}</p>
                                            <small>{convertToVietnamTime(msg.createdAt)}</small> 
                                        </div>
                                    ))
                                ) : (
                                    <p>Không có tin nhắn nào.</p>
                                )}
                            </div>
                            <div className="reply-section">
                                <input
                                    type="text"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Nhập câu trả lời..."
                                    disabled={!selectedMessage}
                                />
                                <button onClick={handleReply} disabled={!selectedMessage}>Gửi</button>
                            </div>
                        </>
                    ) : (
                        <p>Chọn một đoạn chat để trả lời.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
