const mongoose = require('mongoose');

const UnansweredQuestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, 
    question: { type: String, required: true },
    reply: { type: String }, 
    answeredAt: { type: Date }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UnansweredQuestion', UnansweredQuestionSchema);