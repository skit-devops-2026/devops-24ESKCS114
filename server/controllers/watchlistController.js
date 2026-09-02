const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');

// @desc    Get current user's watchlist (filtered by status or all)
// @route   GET /api/watchlist
exports.getWatchlist = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = { user: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const watchlist = await Watchlist.find(query)
      .populate('movie')
      .sort({ [sortBy]: sortOrder });

    // Status counts for tabs
    const counts = {
      all: await Watchlist.countDocuments({ user: req.user.id }),
      want_to_watch: await Watchlist.countDocuments({ user: req.user.id, status: 'want_to_watch' }),
      watching: await Watchlist.countDocuments({ user: req.user.id, status: 'watching' }),
      watched: await Watchlist.countDocuments({ user: req.user.id, status: 'watched' }),
      dropped: await Watchlist.countDocuments({ user: req.user.id, status: 'dropped' }),
    };

    res.json({
      success: true,
      count: watchlist.length,
      counts,
      data: watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist',
      error: error.message,
    });
  }
};

// @desc    Add or update movie in user watchlist
// @route   POST /api/watchlist
exports.addToWatchlist = async (req, res) => {
  try {
    const { movieId, status = 'want_to_watch', userRating, notes } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, message: 'Movie ID is required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Upsert watchlist entry
    let item = await Watchlist.findOne({ user: req.user.id, movie: movieId });

    if (item) {
      item.status = status;
      if (userRating !== undefined) item.userRating = userRating;
      if (notes !== undefined) item.notes = notes;
      await item.save();
    } else {
      item = await Watchlist.create({
        user: req.user.id,
        movie: movieId,
        status,
        userRating: userRating || 0,
        notes: notes || '',
      });
    }

    await item.populate('movie');

    const statusLabels = {
      want_to_watch: 'Want to Watch',
      watching: 'Currently Watching',
      watched: 'Watched',
      dropped: 'Dropped',
    };

    res.json({
      success: true,
      message: `Added to "${statusLabels[status] || status}"!`,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update watchlist',
    });
  }
};

// @desc    Update watchlist item status / rating
// @route   PUT /api/watchlist/:id
exports.updateWatchlist = async (req, res) => {
  try {
    const { status, userRating, notes } = req.body;

    let item = await Watchlist.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Watchlist entry not found' });
    }

    if (status) item.status = status;
    if (userRating !== undefined) item.userRating = userRating;
    if (notes !== undefined) item.notes = notes;

    await item.save();
    await item.populate('movie');

    res.json({
      success: true,
      message: 'Watchlist updated successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update watchlist entry',
      error: error.message,
    });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:id
exports.removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      $or: [
        { _id: req.params.id, user: req.user.id },
        { movie: req.params.id, user: req.user.id },
      ],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Watchlist item not found' });
    }

    res.json({
      success: true,
      message: 'Movie removed from your watchlist',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove from watchlist',
      error: error.message,
    });
  }
};
