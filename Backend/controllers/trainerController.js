const Trainer = require('../models/Trainer');

// Create a new trainer
const createTrainer = async (req, res) => {
  const { name, email, phone, categories } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const existingTrainer = await Trainer.findOne({ where: { email } });
    if (existingTrainer) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    const newTrainer = await Trainer.create({
      name,
      email,
      phone: phone || null,
      categories: Array.isArray(categories) ? categories : [],
    });

    return res.status(201).json({
      message: 'Trainer created successfully.',
      trainer: newTrainer,
    });
  } catch (err) {
    console.error('[createTrainer]', err);
    return res.status(500).json({ error: 'Failed to create trainer.' });
  }
};

// Get all trainers
const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      message: 'Trainers fetched successfully.',
      trainers,
    });
  } catch (err) {
    console.error('[getTrainers]', err);
    return res.status(500).json({ error: 'Failed to fetch trainers.' });
  }
};

// Get all trainers including inactive
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      message: 'All trainers fetched successfully.',
      trainers,
    });
  } catch (err) {
    console.error('[getAllTrainers]', err);
    return res.status(500).json({ error: 'Failed to fetch trainers.' });
  }
};

// Update trainer
const updateTrainer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, categories, isActive } = req.body;

  if (!name && !email && !phone && !categories && isActive === undefined) {
    return res.status(400).json({ error: 'At least one field must be provided for update.' });
  }

  try {
    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    // Check if new email already exists (excluding current trainer)
    if (email && email !== trainer.email) {
      const existingTrainer = await Trainer.findOne({ where: { email } });
      if (existingTrainer) {
        return res.status(409).json({ error: 'Email already exists.' });
      }
    }

    // Update fields
    if (name) trainer.name = name;
    if (email) trainer.email = email;
    if (phone !== undefined) trainer.phone = phone || null;
    if (categories) trainer.categories = Array.isArray(categories) ? categories : [];
    if (isActive !== undefined) trainer.isActive = isActive;

    await trainer.save();

    return res.json({
      message: 'Trainer updated successfully.',
      trainer,
    });
  } catch (err) {
    console.error('[updateTrainer]', err);
    return res.status(500).json({ error: 'Failed to update trainer.' });
  }
};

// Delete trainer (soft delete via isActive flag)
const deleteTrainer = async (req, res) => {
  const { id } = req.params;

  try {
    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    // Soft delete by setting isActive to false
    trainer.isActive = false;
    await trainer.save();

    return res.json({
      message: 'Trainer deactivated successfully.',
      trainer,
    });
  } catch (err) {
    console.error('[deleteTrainer]', err);
    return res.status(500).json({ error: 'Failed to delete trainer.' });
  }
};

module.exports = {
  createTrainer,
  getTrainers,
  getAllTrainers,
  updateTrainer,
  deleteTrainer,
};
