const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// GET all movies (supports search, status filter, genre filter, sorting)
router.get('/', async (req, res) => {
  try {
    const { search, status, genre, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const movies = await Movie.find(query).sort({ [sortBy]: sortOrder });

    res.json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching movies',
      error: error.message,
    });
  }
});

// GET movie statistics summary
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Movie.countDocuments();
    const completed = await Movie.countDocuments({ status: 'Completed' });
    const watching = await Movie.countDocuments({ status: 'Watching' });
    const planToWatch = await Movie.countDocuments({ status: 'Plan to Watch' });

    const ratedMovies = await Movie.find({ rating: { $gt: 0 } });
    const avgRating =
      ratedMovies.length > 0
        ? (
            ratedMovies.reduce((acc, curr) => acc + curr.rating, 0) /
            ratedMovies.length
          ).toFixed(1)
        : '0.0';

    res.json({
      success: true,
      stats: {
        total,
        completed,
        watching,
        planToWatch,
        avgRating,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie stats',
      error: error.message,
    });
  }
});

// GET single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }
    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching movie details',
      error: error.message,
    });
  }
});

// POST create a new movie
router.post('/', async (req, res) => {
  try {
    const { title, genre, releaseYear, posterUrl, status, rating, notes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Movie title is required',
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      genre: genre || 'Other',
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      posterUrl: posterUrl ? posterUrl.trim() : '',
      status: status || 'Plan to Watch',
      rating: rating !== undefined && rating !== '' ? Number(rating) : 0,
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist successfully',
      data: movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add movie',
    });
  }
});

// PUT update a movie by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, genre, releaseYear, posterUrl, status, rating, notes } = req.body;

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    if (title !== undefined) movie.title = title.trim();
    if (genre !== undefined) movie.genre = genre;
    if (releaseYear !== undefined) movie.releaseYear = releaseYear ? Number(releaseYear) : undefined;
    if (posterUrl !== undefined) movie.posterUrl = posterUrl ? posterUrl.trim() : '';
    if (status !== undefined) movie.status = status;
    if (rating !== undefined && rating !== '') movie.rating = Number(rating);
    if (notes !== undefined) movie.notes = notes.trim();

    const updatedMovie = await movie.save();

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update movie',
    });
  }
});

// DELETE a movie by ID
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.json({
      success: true,
      message: 'Movie removed from watchlist',
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error.message,
    });
  }
});

module.exports = router;
