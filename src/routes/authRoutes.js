const express = require('express');
const {
    register,
    login,
    getMe,
    softDeleteUser
} = require('../controllers/authController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.delete('/users/:id', protect, authorize('admin'), softDeleteUser);

module.exports = router;
