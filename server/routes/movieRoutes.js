const express = require('express');
const router = express.Router();
const {
  getMovies,
  getFeatured,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getGenreSummary,
} = require('../controllers/movieController');
const { optionalAuth, protect, authorize } = require('../middleware/auth');

router.get('/', getMovies);
router.get('/featured', getFeatured);
router.get('/genres/summary', getGenreSummary);
router.get('/:id', optionalAuth, getMovieById);

// Admin-enabled actions
router.post('/', protect, createMovie);
router.put('/:id', protect, updateMovie);
router.delete('/:id', protect, deleteMovie);

module.exports = router;