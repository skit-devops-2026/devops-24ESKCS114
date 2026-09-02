const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const movieRoutes = require('./routes/movieRoutes');

const app = express();
// Default to port 3000 to avoid conflicts with macOS AirPlay Receiver on port 5000
const PORT = process.env.PORT || 3000;
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

// Function to start server with error handling
function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🎬 Movie Watchlist Server running on: http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another app.`);
      console.log(`💡 Solution: Change PORT in your .env file (e.g. PORT=3001 or PORT=5050)`);
    } else {
      console.error('Server error:', err.message);
    }
  });
}

// Connect to MongoDB & Start Server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB database');
    startServer();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Tip: Make sure MongoDB is running locally (brew services start mongodb-community) or add your MongoDB Atlas URI to .env');
    startServer();
  });
