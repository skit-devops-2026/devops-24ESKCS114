const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  updateWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.put('/:id', updateWatchlist);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
