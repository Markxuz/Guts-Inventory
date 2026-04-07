const router = require('express').Router();
const { login, register, getProfile, adminCreateUser, listUsers, updateUser, deleteUser } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', verifyToken, getProfile);

// Admin-only routes
router.post('/admin/create-user', verifyToken, requireRole('admin'), adminCreateUser);
router.get('/admin/users', verifyToken, requireRole('admin'), listUsers);
router.put('/admin/users/:id', verifyToken, requireRole('admin'), updateUser);
router.delete('/admin/users/:id', verifyToken, requireRole('admin'), deleteUser);

module.exports = router;
