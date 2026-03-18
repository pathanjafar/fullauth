const nodemailer = require('nodemailer');

let transporter = null;

async function initTransporter() {
    if (
        process.env.USE_EMAIL === 'true' &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
    ) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log(`📧 Email transport initialized for ${process.env.EMAIL_USER}`);
    } else {
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
    }
}

module.exports = { sendEmail };
