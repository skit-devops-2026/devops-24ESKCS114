const Watchlist = require('../models/Watchlist');
const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');

// @desc    Get personalized movie recommendations
// @route   GET /api/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    let preferredGenres = ['Sci-Fi', 'Action', 'Drama'];
    let anchorMovieTitle = null;

    if (req.user) {
      // Find what user watched or favorited
      const watched = await Watchlist.find({ user: req.user.id }).populate('movie');
      const favorites = await Favorite.find({ user: req.user.id }).populate('movie');

      const userMovieIds = [
        ...watched.map((w) => w.movie?._id?.toString()),
        ...favorites.map((f) => f.movie?._id?.toString()),
      ].filter(Boolean);

      const genreFrequency = {};

      [...watched, ...favorites].forEach((item) => {
        if (item.movie && item.movie.genre) {
          item.movie.genre.forEach((g) => {
            genreFrequency[g] = (genreFrequency[g] || 0) + 1;
          });
        }
      });

      const sortedGenres = Object.entries(genreFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([g]) => g);

      if (sortedGenres.length > 0) {
        preferredGenres = sortedGenres.slice(0, 3);
      }

      if (watched.length > 0 && watched[0].movie) {
        anchorMovieTitle = watched[0].movie.title;
      } else if (favorites.length > 0 && favorites[0].movie) {
        anchorMovieTitle = favorites[0].movie.title;
      }

      // Recommend top rated movies in preferred genres that user hasn't added yet
      const recommendations = await Movie.find({
        genre: { $in: preferredGenres },
        _id: { $nin: userMovieIds },
      })
        .sort({ rating: -1 })
        .limit(10);

      // If user has seen all or few matches, fallback to top-rated
      let finalRecommendations = recommendations;
      if (finalRecommendations.length < 4) {
        const fallbacks = await Movie.find({ _id: { $nin: userMovieIds } })
          .sort({ rating: -1 })
          .limit(8);
        finalRecommendations = fallbacks;
      }

      return res.json({
        success: true,
        preferredGenres,
        anchorMovieTitle: anchorMovieTitle || 'your favorites',
        recommendations: finalRecommendations,
      });
    }

    // Guest recommendations: top rated
    const guestRecs = await Movie.find().sort({ rating: -1 }).limit(8);
    res.json({
      success: true,
      preferredGenres,
      anchorMovieTitle: 'Top Blockbusters',
      recommendations: guestRecs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    });
  }
};
