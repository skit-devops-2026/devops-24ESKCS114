const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');

// @desc    Get user's favorites
// @route   GET /api/favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('movie')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error.message,
    });
  }
};

// @desc    Toggle favorite (Add or Remove)
// @route   POST /api/favorites/:movieId
exports.toggleFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const existing = await Favorite.findOne({ user: req.user.id, movie: movieId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({
        success: true,
        isFavorite: false,
        message: 'Removed from Favorites',
      });
    } else {
      await Favorite.create({ user: req.user.id, movie: movieId });
      return res.json({
        success: true,
        isFavorite: true,
        message: 'Added to Favorites! ❤️',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating favorites',
      error: error.message,
    });
  }
};
