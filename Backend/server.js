const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const inventoryRoutes = require('./routes/inventoryRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/inventory', inventoryRoutes);
app.use('/api/history', historyRoutes);

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
    // Switch to force:true only to completely reset schema during early development.
    await sequelize.sync({ alter: true });
    console.log('✔  Models synchronized.');

    app.listen(PORT, () => {
      console.log(`✔  Server running → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('✖  Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
