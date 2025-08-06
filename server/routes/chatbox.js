const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const UnansweredQuestion = require('../models/unansweredQuestion');

// Lấy danh sách câu hỏi
router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý chat
router.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const userId = req.body.userId;

    try {
        const question = await Question.findOne({ question: userMessage });
        if (question) {
            // Nếu có câu hỏi, trả về câu trả lời
            return res.json({ reply: question.answer });
        } else {
            // Lưu câu hỏi chưa trả lời
            const newUnansweredQuestion = new UnansweredQuestion({ 
                question: userMessage,
                userId: userId
            });
            await newUnansweredQuestion.save();
            return res.json({ reply: "Xin lỗi, tôi không biết câu trả lời. Admin sẽ xem xét câu hỏi của bạn." });
        }
    } catch (error) {
        console.error("Lỗi khi xử lý tin nhắn:", error);
        res.status(500).json({ message: error.message });
    }
});

// API để người dùng gửi câu hỏi
router.post('/ask', async (req, res) => {
    const { userId, question } = req.body;

    try {
        const newQuestion = new UnansweredQuestion({
            userId: userId,
            question: question
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Câu hỏi đã được gửi thành công!' });
    } catch (error) {
        console.error("Lỗi khi xử lý tin nhắn:", error);
        res.status(400).json({ message: error.message });
    }
});

// Lấy danh sách câu hỏi và câu trả lời của người dùng
router.get('/user-questions/:userId', async (req, res) => {
    try {
        const questions = await UnansweredQuestion.find({ userId: req.params.userId });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;