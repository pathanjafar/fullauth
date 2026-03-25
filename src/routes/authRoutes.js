const express = require('express');
const {
    register,
    login,
    getMe,
    softDeleteUser,
    sendOTP
} = require('../controllers/authController');

const { forgotPassword, resetPassword } = require('../controllers/passwordController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.get('/test-email', async (req, res) => {
    const { verifyConnection } = require('../utils/email');
    const result = await verifyConnection();
    res.status(result.success ? 200 : 500).json(result);
});
router.get('/me', protect, getMe);
router.delete('/users/:id', protect, authorize('admin'), softDeleteUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
