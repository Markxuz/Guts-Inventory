const express = require('express');
const {
  getAllCourses,
  getActiveCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getArchivedCourses,
  restoreCourse,
  hardDeleteCourse,
} = require('../controllers/courseController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can perform this action' });
  }
  next();
};

// Get only active courses (all authenticated users)
router.get('/courses/active', getActiveCourses);

// Get all courses (admin only)
router.get('/courses', verifyToken, checkAdmin, getAllCourses);

// Get archived courses (admin only)
router.get('/courses/archived', verifyToken, checkAdmin, getArchivedCourses);

// Create a new course (admin only)
router.post('/courses', verifyToken, checkAdmin, createCourse);

// Update a course (admin only)
router.put('/courses/:courseId', verifyToken, checkAdmin, updateCourse);

// Restore a course (admin only)
router.put('/courses/:courseId/restore', verifyToken, checkAdmin, restoreCourse);

// Delete a course - soft delete (admin only)
router.delete('/courses/:courseId', verifyToken, checkAdmin, deleteCourse);

// Hard delete a course - permanent removal (admin only)
router.delete('/courses/:courseId/permanent', verifyToken, checkAdmin, hardDeleteCourse);

module.exports = router;
