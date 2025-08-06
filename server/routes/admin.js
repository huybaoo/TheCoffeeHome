const express = require('express');
const router = express.Router();
const moment = require('moment');
const Admin = require('../models/admin');
const UnansweredQuestion = require('../models/unansweredQuestion');
const convertToVietnamTime = (date) => {
    return new Date(date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

// API để đăng nhập admin
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username, password });
        if (!admin) {
            return res.status(401).json({ message: 'Sai tên người dùng hoặc mật khẩu' });
        }
        res.status(200).json({ message: 'Đăng nhập thành công', admin: { username: admin.username } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API lấy danh sách câu hỏi chưa trả lời
router.get('/unanswered-questions', async (req, res) => {
    try {
        const questions = await UnansweredQuestion.find({ reply: null });
        res.json({ count: questions.length, questions }); // Trả về số lượng chưa trả lời
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Gửi câu trả lời cho câu hỏi chưa trả lời
router.post('/reply', async (req, res) => {
    const { questionId, reply } = req.body;

    try {
        const updatedQuestion = await UnansweredQuestion.findByIdAndUpdate(questionId, {
            reply: reply,
            answeredAt: new Date()
        });

        // Cập nhật lại chat của user
        const userId = updatedQuestion.userId; // Lấy userId từ câu hỏi đã cập nhật
        await UnansweredQuestion.updateOne(
            { _id: questionId },
            { $set: { reply: reply } }
        );

        res.json({ message: "Câu trả lời đã được gửi thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API lấy những tin nhắn chưa được trả lời
router.get('/getUsersWithMessages', async (req, res) => {
    try {
        const users = await UnansweredQuestion.aggregate([
            {
                $match: { reply: { $exists: false } } // Chỉ lấy tin nhắn chưa có phản hồi
            },
            {
                $group: {
                    _id: "$userId",
                    unreadCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $project: {
                    _id: 1,
                    unreadCount: 1,
                    name: { $arrayElemAt: ["$userInfo.Name", 0] },
                    email: { $arrayElemAt: ["$userInfo.Email", 0] }
                }
            }
        ]);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách user", error });
    }
});

// API lấy tin nhắn của user
router.get('/getMessages', async (req, res) => {
    const { userId } = req.query;

    try {
        const messages = await UnansweredQuestion.find({ userId })
            .sort({ createdAt: 1 })
            .select("question reply createdAt answeredAt");

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            question: msg.question,
            reply: msg.reply,
            createdAt: convertToVietnamTime(msg.createdAt),
            answeredAt: msg.answeredAt ? convertToVietnamTime(msg.answeredAt) : null
        }));

        res.json(formattedMessages);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy tin nhắn", error });
    }
});

//
router.get('/chats', async (req, res) => {
    try {
        const chats = await UnansweredQuestion.find().populate('userId', 'Name Email');
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách chat", error });
    }
});

module.exports = router;