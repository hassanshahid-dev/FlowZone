import nodemailer from 'nodemailer';

async function testEmail() {
    console.log('📧 Testing Gmail SMTP OTP Dispatch to grandhassan66@gmail.com...');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: '"TabFlow Verification" <iammuhammad3005@gmail.com>',
        to: 'grandhassan66@gmail.com',
        subject: `Your TabFlow Security OTP: ${testOtp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 22px;">TabFlow Email Verification</h2>
                    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Confirm email ownership to activate your account</p>
                </div>
                <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 14px; line-height: 1.5;">Please use the 6-digit security verification code below to verify your email address:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #2563eb; border-radius: 12px; margin: 20px 0;">
                    ${testOtp}
                </div>

                <p style="color: #64748b; font-size: 12px; text-align: center;">This verification code is valid for <strong>10 minutes</strong>.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email dispatched successfully! Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ Email dispatch failed:', err.message);
    }
}

testEmail();
