import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validateEmailAddress } from '../middleware/validateEmail.js';

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

        res.status(200).json({
            message: `OTP sent to ${normalizedEmail}`,
            email: normalizedEmail,
            otpCode, // Returned for instant testing preview
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

        res.status(200).json({
            message: `2FA Security OTP sent to ${normalizedEmail}`,
            email: normalizedEmail,
            otpCode, // Returned for instant testing preview
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

        res.status(200).json({
            message: `Fresh OTP code sent to ${normalizedEmail}`,
            email: normalizedEmail,
            otpCode
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

// Google OAuth
router.post('/google', async (req, res) => {
    try {
        let { email, name, credential } = req.body;

        // If Google JWT Credential string is passed, decode the payload
        if (credential && !email) {
            try {
                const parts = credential.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                    if (payload.email) {
                        email = payload.email;
                        name = payload.name || name;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse Google JWT payload:', e.message);
            }
        }

        if (!email) return res.status(400).json({ error: 'Valid Google email is required' });

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
            user = await User.create({
                email: normalizedEmail,
                password: randomPassword,
                isVerified: true,
                plan: 'free'
            });
        } else if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        res.status(200).json({
            token: generateToken(user),
            user: { id: user._id, email: user.email, plan: user.plan }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;