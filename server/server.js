const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const createApp = () => {
  const app = express();

  // Global Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve Frontend Static Files
  app.use(express.static(path.join(__dirname, '../public')));

  // API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/recommendations', recommendationRoutes);

  // System Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      appName: 'MovForYou',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Custom 404 handler for HTML pages
  app.use((req, res, next) => {
    if (req.accepts('html')) {
      return res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
    }
    res.status(404).json({ success: false, message: 'Resource not found' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
};

if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3000;

  connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🎬 MovForYou Platform running on: http://localhost:${PORT}`);
    console.log(`🍿 Open your browser at http://localhost:${PORT} to explore cinema`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is in use.`);
      console.log(`💡 Change PORT in your .env file (e.g. PORT=3001)`);
    } else {
      console.error('Server error:', err.message);
    }
  });
}

module.exports = { createApp, connectDB };
