const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const seedMovies = require('../data/seedMovies');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movforyou';
    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed starter movies if collection is empty
    const count = await Movie.countDocuments();
    if (count === 0) {
      console.log('🎬 Seeding initial curated blockbuster movies...');
      await Movie.insertMany(seedMovies);
      console.log(`🍿 Successfully seeded ${seedMovies.length} movies into MovForYou!`);
    }

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Tip: Make sure MongoDB is running or configure your MONGODB_URI in .env');
    return null;
  }
};

module.exports = connectDB;
