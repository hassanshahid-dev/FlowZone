import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);