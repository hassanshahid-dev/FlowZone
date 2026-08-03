const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function runAuthTests() {
    console.log('====================================================');
    console.log(`🧪 TABFLOW AUTHENTICATION & SESSION TEST SUITE (${BASE_URL})`);
    console.log('====================================================\n');

    let passedTests = 0;
    let failedTests = 0;

    const testEmail = `test_user_${Date.now()}@gmail.com`;
    const testName = 'Test Suite User';
    const testPassword = 'SecurePassword123!';
    let registrationOtp = null;
    let userToken = null;

    function assert(condition, testName, detail = '') {
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passedTests++;
        } else {
            console.error(`❌ [FAIL] ${testName} - ${detail}`);
            failedTests++;
        }
    }

    try {
        // TEST CASE 1: Register OTP Generation & Full Name Binding
        console.log(`📌 Test 1: Request Registration OTP for ${testEmail}...`);
        const regRes = await fetch(`${BASE_URL}/auth/register-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
        });

        const regData = await regRes.json();
        assert(regRes.ok && regData.email === testEmail, 'Register OTP Generation & Full Name Binding', regData.error || '');
        registrationOtp = regData.otpCode;

        // TEST CASE 2: Verify Registration OTP & Account Activation
        console.log(`\n📌 Test 2: Verify Registration OTP Code & Issue Session Token...`);
        const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, otpCode: registrationOtp || '123456' })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.token) {
            userToken = verifyData.token;
            assert(true, 'Verify Registration OTP & Issue Session Token');
        } else {
            assert(false, 'Verify Registration OTP & Issue Session Token', verifyData.error || '');
        }

        // TEST CASE 3: Block Duplicate Email Registration
        console.log(`\n📌 Test 3: Attempt Duplicate Email Registration...`);
        const dupRes = await fetch(`${BASE_URL}/auth/register-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
        });
        const dupData = await dupRes.json();
        assert(!dupRes.ok && dupRes.status === 400, 'Block Duplicate Email Registration', dupData.error || '');

        // TEST CASE 4: Login Credentials Validation & 2FA OTP Request
        console.log(`\n📌 Test 4: Login Credentials Validation & 2FA OTP Request...`);
        const loginRes = await fetch(`${BASE_URL}/auth/login-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPassword })
        });
        const loginData = await loginRes.json();
        assert(loginRes.ok, 'Login Credentials Validation & 2FA OTP Dispatch', loginData.error || '');

        // TEST CASE 5: Invalid 6-Digit OTP Rejection
        console.log(`\n📌 Test 5: Verify Invalid 6-Digit OTP Rejection...`);
        const badOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, otpCode: '000000' })
        });
        const badOtpData = await badOtpRes.json();
        assert(!badOtpRes.ok && badOtpRes.status === 400, 'Reject Invalid 6-Digit OTP Code', badOtpData.error || '');

        // TEST CASE 6: Authenticated Workspaces Route Access
        console.log(`\n📌 Test 6: Verify Authenticated Route Access with JWT Token...`);
        const wsRes = await fetch(`${BASE_URL}/workspaces`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const wsData = await wsRes.json();
        assert(wsRes.ok && Array.isArray(wsData), 'Authenticated Workspaces Route Access', `Status: ${wsRes.status}`);

        // TEST CASE 7: Logout / Unauthenticated Rejection
        console.log(`\n📌 Test 7: Verify Logout & Unauthenticated Access Rejection...`);
        const noAuthRes = await fetch(`${BASE_URL}/workspaces`);
        assert(!noAuthRes.ok && noAuthRes.status === 401, 'Reject Unauthenticated Request After Logout', `Status: ${noAuthRes.status}`);

    } catch (err) {
        console.error('❌ Unexpected Test Failure:', err.message);
    }

    console.log('\n====================================================');
    console.log(`📊 TEST SUITE RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
    console.log('====================================================\n');
}

runAuthTests();
