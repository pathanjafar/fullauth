const nodemailer = require('nodemailer');

let transporter = null;

async function initTransporter() {
    console.log('🔍 Checking Email Config:', {
        USE_EMAIL: process.env.USE_EMAIL,
        EMAIL_USER: process.env.EMAIL_USER ? '✅ set' : '❌ missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? '✅ set' : '❌ missing',
        NODE_ENV: process.env.NODE_ENV
    });

    if (
        process.env.USE_EMAIL === 'true' &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
    ) {
        try {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: Number(process.env.EMAIL_PORT) || 465,
                secure: process.env.EMAIL_SECURE !== 'false', // Default true for 465
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            // Verify connection
            await transporter.verify();
            console.log(`📧 Email transport VERIFIED for ${process.env.EMAIL_USER}`);
        } catch (err) {
            console.error('📧 Email transport verification FAILED:', err.message);
        }
    } else {
        // Fallback or Ethereal
        const testAccount = nodemailer.createTestAccount ? await nodemailer.createTestAccount() : null;
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount ? testAccount.user : 'ethereal',
                pass: testAccount ? testAccount.pass : 'pass',
            },
        });
        console.log('📧 Ethereal test email transport initialized');
    }
}

initTransporter();

/**
 * Send a generic email
 */
async function sendEmail({ to, subject, html }) {
    if (!transporter) {
        console.warn('⚠️  Email transporter not ready');
        return;
    }
    try {
        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER || 'noreply@fullauth.com',
            to,
            subject,
            html,
        });
        if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(result)) {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
        }
        return result;
    } catch (err) {
        console.error('Email send error:', err.message);
        throw err; // Rethrow to catch in controller
    }
}

async function verifyConnection() {
    if (!transporter) return { success: false, message: 'Transporter not initialized' };
    try {
        await transporter.verify();
        return { success: true, message: 'SMTP Connection Verified' };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

module.exports = { sendEmail, verifyConnection };
