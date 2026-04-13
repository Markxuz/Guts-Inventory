const Course = require('../models/Course');

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get active courses only
const getActiveCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    res.json({ courses });
  } catch (err) {
    console.error('Error fetching active courses:', err);
    res.status(500).json({ error: 'Failed to fetch active courses' });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Course name and code are required' });
    }

    const existingCourse = await Course.findOne({
      where: { code },
    });

    if (existingCourse) {
      return res.status(400).json({ error: 'A course with this code already exists' });
    }

    const course = await Course.create({
      name,
      code,
      description,
      isActive: true,
    });

    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    console.error('Error creating course:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Course name or code already exists' });
    }
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Update a course
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, code, description, isActive } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if new code conflicts with existing courses
    if (code && code !== course.code) {
      const existingCourse = await Course.findOne({
        where: { code },
      });
      if (existingCourse) {
        return res.status(400).json({ error: 'A course with this code already exists' });
      }
    }

    if (name) course.name = name;
    if (code) course.code = code;
    if (description !== undefined) course.description = description;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();
    res.json({ course, message: 'Course updated successfully' });
  } catch (err) {
    console.error('Error updating course:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Course name or code already exists' });
    }
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Delete a course (soft delete by marking inactive)
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.isActive = false;
    await course.save();

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

// Get archived courses (soft deleted)
const getArchivedCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { isActive: false },
      order: [['name', 'ASC']],
    });
    res.json({ courses });
  } catch (err) {
    console.error('Error fetching archived courses:', err);
    res.status(500).json({ error: 'Failed to fetch archived courses' });
  }
};

// Restore a course (undo soft delete)
const restoreCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.isActive = true;
    await course.save();

    res.json({ course, message: 'Course restored successfully' });
  } catch (err) {
    console.error('Error restoring course:', err);
    res.status(500).json({ error: 'Failed to restore course' });
  }
};

// Hard delete a course (permanent removal)
const hardDeleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await course.destroy();

    res.json({ message: 'Course permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting course:', err);
    res.status(500).json({ error: 'Failed to permanently delete course' });
  }
};

module.exports = {
  getAllCourses,
  getActiveCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getArchivedCourses,
  restoreCourse,
  hardDeleteCourse,
};
