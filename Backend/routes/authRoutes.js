const router = require('express').Router();
const { login, register, getProfile, adminCreateUser } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', verifyToken, getProfile);

// Admin-only routes
router.post('/admin/create-user', verifyToken, requireRole('admin'), adminCreateUser);

module.exports = router;
