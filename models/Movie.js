const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: [
        'Action',
        'Adventure',
        'Animation',
        'Comedy',
        'Crime',
        'Documentary',
        'Drama',
        'Fantasy',
        'Horror',
        'Mystery',
        'Romance',
        'Sci-Fi',
        'Thriller',
        'Western',
        'Other',
      ],
      default: 'Other',
    },
    releaseYear: {
      type: Number,
      min: [1888, 'Year must be 1888 or later'],
      max: [new Date().getFullYear() + 5, 'Year cannot be too far in the future'],
    },
    posterUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Plan to Watch', 'Watching', 'Completed'],
      default: 'Plan to Watch',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [10, 'Rating cannot exceed 10'],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);
