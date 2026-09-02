const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    poster: {
      type: String,
      trim: true,
      default: '',
    },
    backdrop: {
      type: String,
      trim: true,
      default: '',
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      default: ['Action'],
    },
    releaseDate: {
      type: String,
      default: '2024-01-01',
    },
    runtime: {
      type: Number,
      default: 120,
    },
    language: {
      type: String,
      default: 'English',
    },
    director: {
      type: String,
      default: 'Unknown Director',
    },
    cast: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0,
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
