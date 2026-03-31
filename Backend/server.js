const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const sequelize = require('./config/database');
const inventoryRoutes = require('./routes/inventoryRoutes');
const historyRoutes = require('./routes/historyRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const userSockets = {}; // Map userId to socket ID

io.on('connection', (socket) => {
  console.log(`📱 Socket connected: ${socket.id}`);

  // When user logs in, register their socket
  socket.on('user_connect', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`✓ User ${userId} connected to notifications`);
  });

  // When user disconnects
  socket.on('disconnect', () => {
    // Remove user from map
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`✗ User ${userId} disconnected`);
      }
    }
  });
});

// Make io accessible to routes
app.locals.io = io;
app.locals.userSockets = userSockets;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔  Database connection established.');

    // alter:true updates existing tables to match the current model without data loss.
    // Use force:true only to fix schema errors (will delete all data)
    await sequelize.sync({ alter: true });
    console.log('✔  Models synchronized.');

    server.listen(PORT, () => {
      console.log(`✔  Server running → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
