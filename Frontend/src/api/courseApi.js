import api from './axios';

// Get all courses (admin)
export const getAllCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

// Get only active courses
export const getActiveCourses = async () => {
  const response = await api.get('/courses/active');
  return response.data;
};

// Get archived courses (soft deleted)
export const getArchivedCourses = async () => {
  const response = await api.get('/courses/archived');
  return response.data;
};

// Create a new course
export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

// Update a course
export const updateCourse = async (courseId, courseData) => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

// Delete a course (soft delete)
export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

// Restore a course
export const restoreCourse = async (courseId) => {
  const response = await api.put(`/courses/${courseId}/restore`);
  return response.data;
};

// Hard delete a course (permanent removal)
export const hardDeleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}/permanent`);
  return response.data;
};
