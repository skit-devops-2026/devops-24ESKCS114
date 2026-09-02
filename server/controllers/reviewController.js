const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get reviews for a movie
// @route   GET /api/reviews/:movieId
exports.getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;

    res.json({
      success: true,
      count: total,
      avgRating,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// @desc    Create a review for a movie
// @route   POST /api/reviews/:movieId
exports.createReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const movieId = req.params.movieId;

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating (1-5 stars) and review text',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existing = await Review.findOne({ user: req.user.id, movie: movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie. You can edit your existing review.',
      });
    }

    const newReview = await Review.create({
      user: req.user.id,
      movie: movieId,
      rating: Number(rating),
      review: review.trim(),
    });

    await newReview.populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Review published successfully! ⭐',
      data: newReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit review',
    });
  }
};

// @desc    Update user review
// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    let userReview = await Review.findOne({ _id: req.params.id, user: req.user.id });
    if (!userReview) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
    }

    if (rating !== undefined) userReview.rating = Number(rating);
    if (review !== undefined) userReview.review = review.trim();

    await userReview.save();
    await userReview.populate('user', 'username avatar');

    res.json({
      success: true,
      message: 'Review updated successfully!',
      data: userReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update review',
    });
  }
};

// @desc    Delete user review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const userReview = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!userReview) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};
