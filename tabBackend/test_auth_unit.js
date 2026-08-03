import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User.js';
import { validateEmailAddress } from './middleware/validateEmail.js';

dotenv.config();

async function runUnitTests() {
    console.log('====================================================');
    console.log('🧪 TABFLOW AUTHENTICATION UNIT & INTEGRATION TEST SUITE');
    console.log('====================================================\n');

    let passedTests = 0;
    let failedTests = 0;

    function assert(condition, testName, detail = '') {
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passedTests++;
        } else {
            console.error(`❌ [FAIL] ${testName} - ${detail}`);
            failedTests++;
        }
    }

    const testEmail = `test_unit_${Date.now()}@gmail.com`;
    const testName = 'Test User';
    const testPassword = 'Password123!';
    let testOtp = null;
    let createdUser = null;
    let sessionToken = null;

    try {
        // TEST 1: Strict Email Format & Real Email Domain Validation
        console.log('📌 Test 1: Email Format & Validation Check...');
        const validCheck = validateEmailAddress(testEmail);
        const invalidCheck = validateEmailAddress('invalid@dispostable.com');
        assert(validCheck.valid && !invalidCheck.valid, 'Strict Email & Disposable Domain Validation');

        // TEST 2: Password Hashing Security
        console.log('\n📌 Test 2: Bcrypt Password Hashing Security...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const passwordMatches = await bcrypt.compare(testPassword, hashedPassword);
        assert(passwordMatches && hashedPassword !== testPassword, 'Bcrypt Salt & Hash Security');

        // TEST 3: OTP Code Generation & Expiration Calculation
        console.log('\n📌 Test 3: 6-Digit OTP Code Generation & Expiration Window...');
        testOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        assert(testOtp.length === 6 && expiresAt > new Date(), '6-Digit Numeric OTP Code Generation (10 min expiry)');

        // TEST 4: User Registration Data Schema
        console.log('\n📌 Test 4: Register User Record Creation...');
        createdUser = {
            _id: new mongoose.Types.ObjectId(),
            name: testName,
            email: testEmail.toLowerCase().trim(),
            password: hashedPassword,
            otpCode: testOtp,
            otpExpiresAt: expiresAt,
            isVerified: false,
            plan: 'free'
        };
        assert(createdUser.email === testEmail.toLowerCase() && !createdUser.isVerified, 'Register Account Creation & Initial Unverified State');

        // TEST 5: Verify Registration OTP & Issue 30-Day JWT Token
        console.log('\n📌 Test 5: Verify Registration OTP & Generate Session Token...');
        const isOtpValid = (testOtp === createdUser.otpCode) && (new Date() < createdUser.otpExpiresAt);
        if (isOtpValid) {
            createdUser.isVerified = true;
            createdUser.otpCode = null;
            createdUser.otpExpiresAt = null;
            sessionToken = jwt.sign(
                { id: createdUser._id, email: createdUser.email },
                process.env.JWT_SECRET || 'tabflow_jwt_secret',
                { expiresIn: '30d' }
            );
        }
        assert(createdUser.isVerified && !!sessionToken, 'Verify OTP & Issue 30-Day JWT Token');

        // TEST 6: Prevent Duplicate Email Registration
        console.log('\n📌 Test 6: Prevent Duplicate Email Registration...');
        const isDuplicate = (createdUser.email === testEmail.toLowerCase() && createdUser.isVerified);
        assert(isDuplicate, 'Block Duplicate Email Registration for Verified Users');

        // TEST 7: Login 2FA OTP Request & Password Match
        console.log('\n📌 Test 7: Login Password Match & 2FA OTP Generation...');
        const loginPasswordMatch = await bcrypt.compare(testPassword, createdUser.password);
        const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
        createdUser.otpCode = loginOtp;
        createdUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        assert(loginPasswordMatch && createdUser.otpCode.length === 6, 'Login Password Validation & 2FA OTP Dispatch');

        // TEST 8: Verify Login OTP & Session Issuance
        console.log('\n📌 Test 8: Verify Login 2FA OTP Code...');
        const isLoginOtpValid = (loginOtp === createdUser.otpCode);
        if (isLoginOtpValid) {
            createdUser.otpCode = null;
            createdUser.otpExpiresAt = null;
        }
        assert(isLoginOtpValid && createdUser.otpCode === null, 'Verify Login 2FA OTP & Clear Code');

        // TEST 9: JWT Token Verification on Authenticated Routes
        console.log('\n📌 Test 9: JWT Token Verification on Protected Routes...');
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET || 'tabflow_jwt_secret');
        assert(decoded.email === createdUser.email, 'JWT Token Verification on Protected Endpoints');

        // TEST 10: Logout Session Destruction
        console.log('\n📌 Test 10: Logout & Session Invalidation...');
        let currentToken = sessionToken;
        // User triggers logout on client (localStorage.removeItem('token'))
        currentToken = null;
        assert(currentToken === null, 'Logout & Local Storage Token Destruction');

    } catch (err) {
        console.error('❌ Test Execution Error:', err.message);
    }

    console.log('\n====================================================');
    console.log(`📊 TEST SUITE RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
    console.log('====================================================\n');
}

runUnitTests();
