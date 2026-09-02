const Movie = require('../models/Movie');
const Watchlist = require('../models/Watchlist');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');

// @desc    Get all movies with search, advanced filter, sorting & pagination
// @route   GET /api/movies
exports.getMovies = async (req, res) => {
  try {
    const {
      search,
      genre,
      yearMin,
      yearMax,
      ratingMin,
      language,
      sortBy = 'rating',
      order = 'desc',
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};

    // Search by title, director, or cast
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { director: { $regex: term, $options: 'i' } },
        { cast: { $regex: term, $options: 'i' } },
      ];
    }

    // Genre filter
    if (genre && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    // Year range filter
    if (yearMin || yearMax) {
      query.releaseDate = {};
      if (yearMin) query.releaseDate.$gte = `${yearMin}-01-01`;
      if (yearMax) query.releaseDate.$lte = `${yearMax}-12-31`;
    }

    // Minimum rating filter
    if (ratingMin) {
      query.rating = { $gte: Number(ratingMin) };
    }

    // Language filter
    if (language && language !== 'All') {
      query.language = language;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sortBy === 'title' ? 'title' : sortBy === 'year' ? 'releaseDate' : sortBy === 'newest' ? 'createdAt' : 'rating';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: movies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
      error: error.message,
    });
  }
};

// @desc    Get home featured & trending movies
// @route   GET /api/movies/featured
exports.getFeatured = async (req, res) => {
  try {
    const heroMovie =
      (await Movie.findOne({ featured: true })) || (await Movie.findOne().sort({ rating: -1 }));
    const trending = await Movie.find({ trending: true }).limit(10);
    const topRated = await Movie.find().sort({ rating: -1 }).limit(10);
    const newReleases = await Movie.find().sort({ releaseDate: -1 }).limit(10);
    const popular = await Movie.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      hero: heroMovie,
      trending,
      topRated,
      newReleases,
      popular,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured movies',
      error: error.message,
    });
  }
};

// @desc    Get movie details by ID
// @route   GET /api/movies/:id
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Community reviews and average rating
    const reviews = await Review.find({ movie: movie._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const avgUserRating =
      reviewCount > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
        : null;

    // Check user watchlist & favorite status if logged in
    let userWatchlist = null;
    let isFavorite = false;

    if (req.user) {
      userWatchlist = await Watchlist.findOne({ user: req.user._id, movie: movie._id });
      const fav = await Favorite.findOne({ user: req.user._id, movie: movie._id });
      isFavorite = !!fav;
    }

    // Similar movies in same genre
    const similar = await Movie.find({
      _id: { $ne: movie._id },
      genre: { $in: movie.genre },
    }).limit(6);

    res.json({
      success: true,
      data: movie,
      reviews,
      reviewCount,
      avgUserRating,
      userStatus: {
        watchlist: userWatchlist ? userWatchlist.status : null,
        isFavorite,
      },
      similar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching movie details',
      error: error.message,
    });
  }
};

// @desc    Add new movie to platform
// @route   POST /api/movies
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      backdrop,
      genre,
      releaseDate,
      runtime,
      language,
      director,
      cast,
      rating,
      trailerUrl,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Movie title and description are required',
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      poster: poster ? poster.trim() : '',
      backdrop: backdrop ? backdrop.trim() : poster || '',
      genre: Array.isArray(genre) ? genre : genre ? [genre] : ['Action'],
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      runtime: Number(runtime) || 120,
      language: language || 'English',
      director: director || 'Director',
      cast: Array.isArray(cast) ? cast : cast ? cast.split(',').map((c) => c.trim()) : [],
      rating: Number(rating) || 8.0,
      trailerUrl: trailerUrl ? trailerUrl.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully!',
      data: movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create movie',
    });
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update movie',
    });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Clean up related watchlists, favorites, and reviews
    await Watchlist.deleteMany({ movie: req.params.id });
    await Favorite.deleteMany({ movie: req.params.id });
    await Review.deleteMany({ movie: req.params.id });

    res.json({
      success: true,
      message: 'Movie and associated records deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error.message,
    });
  }
};

// @desc    Get genre counts
// @route   GET /api/movies/genres/summary
exports.getGenreSummary = async (req, res) => {
  try {
    const genres = [
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
      'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
      'Romance', 'Sci-Fi', 'Thriller', 'Western'
    ];

    const counts = await Promise.all(
      genres.map(async (g) => {
        const count = await Movie.countDocuments({ genre: g });
        return { genre: g, count };
      })
    );

    res.json({
      success: true,
      genres: counts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch genres' });
  }
};
