const router = require('express').Router();
const {
  createTrainer,
  getTrainers,
  getAllTrainers,
  updateTrainer,
  deleteTrainer,
} = require('../controllers/trainerController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/admin/trainers', verifyToken, requireRole('admin'), createTrainer);
router.get('/trainers', verifyToken, getTrainers);
router.get('/admin/trainers', verifyToken, requireRole('admin'), getAllTrainers);
router.put('/admin/trainers/:id', verifyToken, requireRole('admin'), updateTrainer);
router.delete('/admin/trainers/:id', verifyToken, requireRole('admin'), deleteTrainer);

module.exports = router;
