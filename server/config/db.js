const mongoose = require('mongoose');

// Sử dụng mongoURI 
const mongoURI = process.env.MONGO_URI || "mongodb+srv://nhom4:nhom4@cluster0.zmz8v.mongodb.net/thecoffeehouse";

const db = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
};

module.exports = db;