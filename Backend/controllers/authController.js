const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// Login user
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { username, isActive: true } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
};

// Register new user (admin only)
const register = async (req, res) => {
  const { username, email, password, fullName, role } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or staff.' });
  }

  try {
    const existingUser = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      fullName,
      role,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('[getProfile]', err);
    return res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// Admin: Create a new user
const adminCreateUser = async (req, res) => {
  const { username, email, password, fullName, role } = req.body;

  // Verify requester is admin (done via middleware)
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or staff.' });
  }

  try {
    const existingUser = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      fullName,
      role,
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('[adminCreateUser]', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  adminCreateUser,
};
