const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie');
const seedMovies = require('./data/seedMovies');

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movforyou';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected!');

    // Clear existing and insert curated movies
    await Movie.deleteMany({});
    console.log('🗑️  Old records cleared.');

    await Movie.insertMany(seedMovies);
    console.log(`🍿 Successfully loaded ${seedMovies.length} blockbuster movies with HD posters & trailers!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();