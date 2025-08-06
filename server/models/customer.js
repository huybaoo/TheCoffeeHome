const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
    Name: { type: String, unique: true, required: true },
    Email: { type: String, unique: true, required: true },
    Phone: { type: String, required: true },
    Address: { type: String, required: true },
    Password: { type: String, required: true },
    VerificationCode: { type: String },
    isVerified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'customer' });

customerSchema.pre('save', async function (next) {
    if (this.isModified('Password')) {
        this.Password = await bcrypt.hash(this.Password, 10);
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Customer', customerSchema);