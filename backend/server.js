require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
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

// GET users (now requires a logged-in user; sensitive fields hidden)
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

// Connect to MongoDB, then start the server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('MongoDB Host:', mongoose.connection.host);
    console.log('MongoDB Database:', mongoose.connection.name);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });