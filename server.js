const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moviewatchlist';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/movies', movieRoutes);

// Database Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState] || 'Unknown',
  });
});

// Fallback to index.html for any unhandled routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB & Start the Express server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB database');
    app.listen(PORT, () => {
      console.log(`🎬 Movie Watchlist Server running on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Tip: Make sure MongoDB is running locally or check your MONGODB_URI in .env');
    app.listen(PORT, () => {
      console.log(`⚠️  Server started on http://localhost:${PORT} (Database Offline)`);
    });
  });
