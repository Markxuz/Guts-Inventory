const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const requestController = require('../controllers/requestController');

const router = express.Router();

// POST /api/requests - Create a new stock modification request (any authenticated user)
router.post('/', verifyToken, requestController.createRequest);

// GET /api/requests - Get all pending requests (admin only)
router.get('/', verifyToken, requireRole('admin'), requestController.getRequests);

// GET /api/requests/history - Get request history (paginated)
router.get('/history', verifyToken, requireRole('admin'), requestController.getRequestHistory);

// PUT /api/requests/:id/approve - Approve a request (admin only)
router.put('/:id/approve', verifyToken, requireRole('admin'), requestController.approveRequest);

// PUT /api/requests/:id/reject - Reject a request (admin only)
router.put('/:id/reject', verifyToken, requireRole('admin'), requestController.rejectRequest);

module.exports = router;
