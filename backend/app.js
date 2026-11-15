// app.js
// Builds and exports the Express app WITHOUT connecting to MongoDB or listening
// on a port. server.js does those two things for production; the Jest tests
// import this file directly so supertest can send requests to it in memory.

const express = require('express');
const cors = require('cors');

const User = require('./models/User');
const requireAuth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Express API is running!'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/shifts', require('./routes/shifts'));

// GET users (requires a logged-in user; sensitive fields hidden)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await User.find({}).select(
      '-passwordHash -verifyToken -resetToken -resetTokenExpires'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

module.exports = app;
