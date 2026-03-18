const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// In-memory token store. In production, use DB or Redis.
const resetTokens = new Map();

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether user exists
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 15 * 60 * 1000; // 15 min

        resetTokens.set(token, { userId: user._id.toString(), expires });

        const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

        await sendEmail({
            to: email,
            subject: 'Password Reset — FullAuth',
            html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: auto; padding: 2rem; background: #f9f9fb; border-radius: 16px;">
                    <h2 style="font-size: 1.4rem; color: #1a1a1a;">Reset your password</h2>
                    <p style="color: #6b7280; font-size: 0.95rem;">Click the button below. This link expires in 15 minutes.</p>
                    <a href="${resetUrl}" style="display:inline-block; margin-top:1rem; padding: 0.75rem 1.5rem; background: #1D9E75; color:#fff; border-radius:12px; text-decoration:none; font-weight:700;">Reset Password</a>
                    <p style="margin-top:1.5rem; color:#9ca3af; font-size:0.8rem;">If you didn't request this, ignore this email.</p>
                </div>
            `,
        });

        res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const record = resetTokens.get(token);
        if (!record || Date.now() > record.expires) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = await User.findById(record.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = password;
        await user.save();

        // Invalidate token
        resetTokens.delete(token);

        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
