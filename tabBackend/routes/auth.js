import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validateEmailAddress } from '../middleware/validateEmail.js';

import nodemailer from 'nodemailer';

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET || 'tabflow_jwt_secret',
        { expiresIn: '30d' }
    );
};

// Generate 6-Digit Numeric OTP Code
const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Dispatch OTP via Email Transporter
const sendOtpEmail = async (toEmail, otpCode) => {
    try {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = Number(process.env.SMTP_PORT || 465);
        const smtpUser = process.env.SMTP_USER || 'iammuhammad3005@gmail.com';
        const smtpPass = process.env.SMTP_PASS || 'hwmlcusovkidvqii';

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // True for 465, false for 587
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: '"TabFlow Verification" <iammuhammad3005@gmail.com>',
            to: toEmail,
            subject: `Your TabFlow Security OTP: ${otpCode}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0f172a; margin: 0; font-size: 22px;">TabFlow Email Verification</h2>
                        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Confirm email ownership to activate your account</p>
                    </div>
                    <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello,</p>
                    <p style="color: #334155; font-size: 14px; line-height: 1.5;">Please use the 6-digit security verification code below to verify your email address <strong>${toEmail}</strong>:</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #2563eb; border-radius: 12px; margin: 20px 0;">
                        ${otpCode}
                    </div>

                    <p style="color: #64748b; font-size: 12px; text-align: center;">This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ OTP Email dispatched successfully to ${toEmail}`);
        return true;
    } catch (err) {
        console.warn(`⚠️ SMTP dispatch warning for ${toEmail}:`, err.message);
        return false;
    }
};

// =========================================================================
// 1. REGISTER OTP: Verify email non-existence & generate OTP
// =========================================================================
router.post('/register-otp', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Strict Email Format & Real Email Validation
        const emailCheck = validateEmailAddress(email);
        if (!emailCheck.valid) {
            return res.status(400).json({ error: emailCheck.error });
        }

        const normalizedEmail = emailCheck.email;
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'This email is already registered and verified. Please log in.' });
        }

        const otpCode = generateOtpCode();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUser && !existingUser.isVerified) {
            existingUser.password = hashedPassword;
            existingUser.otpCode = otpCode;
            existingUser.otpExpiresAt = otpExpiresAt;
            await existingUser.save();
        } else {
            await User.create({
                email: normalizedEmail,
                password: hashedPassword,
                otpCode,
                otpExpiresAt,
                isVerified: false
            });
        }

        console.log(`🔑 Security OTP Generated for ${normalizedEmail}: ${otpCode}`);
        await sendOtpEmail(normalizedEmail, otpCode);

        res.status(200).json({
            message: `Verification OTP sent to ${normalizedEmail}`,
            email: normalizedEmail,
            expiresInSeconds: 600
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 2. LOGIN OTP: Verify email existence, password match & generate 2FA OTP
// =========================================================================
router.post('/login-otp', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const emailCheck = validateEmailAddress(email);
        if (!emailCheck.valid) {
            return res.status(400).json({ error: emailCheck.error });
        }

        const normalizedEmail = emailCheck.email;
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ error: 'No registered account found with this email. Please register first.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const otpCode = generateOtpCode();
        user.otpCode = otpCode;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        console.log(`🔑 Login 2FA OTP Generated for ${normalizedEmail}: ${otpCode}`);
        await sendOtpEmail(normalizedEmail, otpCode);

        res.status(200).json({
            message: `2FA Security OTP sent to ${normalizedEmail}`,
            email: normalizedEmail,
            expiresInSeconds: 600
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 3. VERIFY OTP: Validate 6-Digit OTP Code & Issue Session Token
// =========================================================================
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({ error: 'Email and OTP code are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ error: 'User account not found' });
        }

        if (!user.otpCode || user.otpCode !== otpCode.trim()) {
            return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
        }

        if (new Date() > new Date(user.otpExpiresAt)) {
            return res.status(400).json({ error: 'OTP code has expired. Please request a new code.' });
        }

        // Mark verified & clear OTP
        user.isVerified = true;
        user.otpCode = null;
        user.otpExpiresAt = null;
        await user.save();

        res.status(200).json({
            message: 'OTP verified successfully!',
            token: generateToken(user),
            user: { id: user._id, email: user.email, plan: user.plan }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 4. RESEND OTP: Generate fresh 6-Digit Code
// =========================================================================
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) return res.status(404).json({ error: 'Account not found' });

        const otpCode = generateOtpCode();
        user.otpCode = otpCode;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOtpEmail(normalizedEmail, otpCode);

        res.status(200).json({
            message: `Fresh OTP code sent to ${normalizedEmail}`,
            email: normalizedEmail
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Legacy Register & Login
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const found = await User.findOne({ email: normalizedEmail });
        if (found) return res.status(400).json({ error: `Email already registered` });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email: normalizedEmail, password: hashed, isVerified: true });
        res.status(201).json({ token: generateToken(user), user: { id: user._id, email: user.email, plan: user.plan } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        res.status(200).json({ token: generateToken(user), user: { id: user._id, email: user.email, plan: user.plan } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;