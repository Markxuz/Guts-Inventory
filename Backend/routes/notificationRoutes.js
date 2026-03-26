const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication
router.use(verifyToken);

// Get all notifications for authenticated user
router.get('/', notificationController.getNotifications);

// Get unread notification count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read/all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
