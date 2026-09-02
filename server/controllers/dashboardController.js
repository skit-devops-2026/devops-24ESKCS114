const Watchlist = require('../models/Watchlist');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get user dashboard analytics and statistics
// @route   GET /api/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Counts
    const totalWatchlist = await Watchlist.countDocuments({ user: userId });
    const watched = await Watchlist.countDocuments({ user: userId, status: 'watched' });
    const wantToWatch = await Watchlist.countDocuments({ user: userId, status: 'want_to_watch' });
    const watching = await Watchlist.countDocuments({ user: userId, status: 'watching' });
    const dropped = await Watchlist.countDocuments({ user: userId, status: 'dropped' });

    const favoritesCount = await Favorite.countDocuments({ user: userId });
    const reviewsCount = await Review.countDocuments({ user: userId });

    // Average rating given by user
    const userReviews = await Review.find({ user: userId });
    const avgRatingGiven =
      userReviews.length > 0
        ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
        : '0.0';

    // Genre distribution in user's watchlist
    const userWatchlistItems = await Watchlist.find({ user: userId }).populate('movie');
    const genreMap = {};

    userWatchlistItems.forEach((item) => {
      if (item.movie && item.movie.genre) {
        item.movie.genre.forEach((g) => {
          genreMap[g] = (genreMap[g] || 0) + 1;
        });
      }
    });

    const genreStats = Object.entries(genreMap)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    // Recent activity list (combining recent watchlist adds, reviews, favorites)
    const recentWatchlist = await Watchlist.find({ user: userId })
      .populate('movie')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentReviews = await Review.find({ user: userId })
      .populate('movie')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      stats: {
        totalWatchlist,
        watched,
        wantToWatch,
        watching,
        dropped,
        favoritesCount,
        reviewsCount,
        avgRatingGiven,
      },
      genreStats,
      recentWatchlist,
      recentReviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};
