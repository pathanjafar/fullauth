const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/email');

// Dummy hash for timing-attack prevention
const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuv';

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        // If login/forgot mode, check if user exists
        if (type === 'login' || type === 'forgot') {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });
        }
        
        // If register mode, check if user exists
        if (type === 'register') {
            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ message: 'User already exists' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP
        await OTP.create({ email, otp: otpCode });

        // Send Email
        await sendEmail({
            to: email,
            subject: 'Your Verification Code — FullAuth',
            html: `
                <div style="font-family: sans-serif; padding: 2rem; background: #f9f9fb; border-radius: 16px;">
                    <h2 style="color: #1a1a1a;">Verification Code</h2>
                    <p style="color: #6b7280;">Use the code below to verify your account. It expires in 5 minutes.</p>
                    <div style="font-size: 2rem; font-weight: 800; color: #1D9E75; letter-spacing: 0.5rem; margin-top: 1rem;">${otpCode}</div>
                </div>
            `,
        });

        res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password, role, otp } = req.body;

    try {
        // Verify OTP
        const storedOTP = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });
        if (!storedOTP) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Delete OTP after use
        await OTP.deleteOne({ _id: storedOTP._id });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            // Timing-attack prevention: perform an expensive operation even if user not found
            await bcrypt.compare(password, DUMMY_HASH);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
};

// @desc    Soft delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.softDeleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token
    });
};
