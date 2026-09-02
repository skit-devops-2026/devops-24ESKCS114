/**
 * MovForYou - Movie Details Page Logic
 */

let currentMovie = null;
let userRatingScore = 0;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (!movieId) {
    window.location.href = 'movies.html';
    return;
  }

  loadMovieDetails(movieId);
  initReviewForm(movieId);
});

async function loadMovieDetails(movieId) {
  try {
    const res = await api.get(`/movies/${movieId}`);
    if (res.success && res.data) {
      currentMovie = res.data;
      renderMovieDetails(res.data, res.userStatus, res.avgUserRating, res.reviewCount);
      renderReviews(res.reviews);
      renderSimilar(res.similar);
    }
  } catch (err) {
    console.error('Error fetching movie details:', err);
    showToast('Movie not found', 'error');
    setTimeout(() => (window.location.href = 'movies.html'), 2000);
  }
}

function renderMovieDetails(movie, userStatus, avgUserRating, reviewCount) {
  // Backdrop & Poster
  const backdropEl = document.getElementById('detailsBackdrop');
  if (backdropEl) backdropEl.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;

  const posterImg = document.getElementById('moviePosterImg');
  if (posterImg) posterImg.src = movie.poster;

  // Title & Metadata
  document.getElementById('movieTitle').textContent = movie.title;
  document.title = `${movie.title} | MovForYou`;

  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : '2024';
  document.getElementById('movieYear').textContent = year;
  document.getElementById('movieRuntime').textContent = `${movie.runtime || 120} min`;
  document.getElementById('movieLanguage').textContent = movie.language || 'English';
  document.getElementById('movieDirector').textContent = movie.director || 'N/A';
  document.getElementById('movieImdbRating').textContent = Number(movie.rating).toFixed(1);
  document.getElementById('movieDescription').textContent = movie.description;

  // Community rating
  const communityRatingEl = document.getElementById('communityRating');
  if (communityRatingEl) {
    communityRatingEl.textContent = avgUserRating
      ? `⭐ ${avgUserRating} / 5 (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
      : 'No user reviews yet';
  }

  // Genres
  const genreContainer = document.getElementById('movieGenres');
  if (genreContainer && movie.genre) {
    genreContainer.innerHTML = movie.genre
      .map((g) => `<span class="badge-genre">${escapeHtml(g)}</span>`)
      .join('');
  }

  // Cast
  const castContainer = document.getElementById('movieCastList');
  if (castContainer && movie.cast) {
    castContainer.innerHTML = movie.cast
      .map((actor) => `<div class="cast-pill"><i class="fa-solid fa-user"></i> ${escapeHtml(actor)}</div>`)
      .join('');
  }

  // Trailer button
  const trailerBtn = document.getElementById('watchTrailerBtn');
  if (trailerBtn) {
    if (movie.trailerUrl) {
      trailerBtn.style.display = 'inline-flex';
      trailerBtn.onclick = () => playTrailer(movie.title, movie.trailerUrl);
    } else {
      trailerBtn.style.display = 'none';
    }
  }

  // Favorite button state
  const favBtn = document.getElementById('detailFavBtn');
  if (favBtn) {
    if (userStatus && userStatus.isFavorite) {
      favBtn.classList.add('active');
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
    } else {
      favBtn.classList.remove('active');
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorite';
    }
    favBtn.onclick = () => toggleFavorite(movie._id, favBtn);
  }

  // Watchlist status select
  const statusSelect = document.getElementById('watchlistStatusSelect');
  if (statusSelect && userStatus && userStatus.watchlist) {
    statusSelect.value = userStatus.watchlist;
  }
}

// Watchlist Status change from Details Page
window.handleStatusChange = async function () {
  const statusSelect = document.getElementById('watchlistStatusSelect');
  if (!statusSelect || !currentMovie) return;

  const status = statusSelect.value;
  await quickAddToWatchlist(currentMovie._id, status);
};

/* ==========================================================================
   Reviews System
   ========================================================================== */
function initReviewForm(movieId) {
  const starIcons = document.querySelectorAll('.star-rating-input i');
  starIcons.forEach((star) => {
    star.addEventListener('click', () => {
      userRatingScore = Number(star.dataset.value);
      updateStarDisplay(userRatingScore);
    });

    star.addEventListener('mouseover', () => {
      updateStarDisplay(Number(star.dataset.value));
    });

    star.addEventListener('mouseleave', () => {
      updateStarDisplay(userRatingScore);
    });
  });

  const reviewForm = document.getElementById('submitReviewForm');
  reviewForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = api.getUser();
    if (!user) {
      showToast('Please sign in to write a review', 'error');
      setTimeout(() => (window.location.href = 'login.html'), 1200);
      return;
    }

    if (userRatingScore === 0) {
      showToast('Please select a star rating (1-5 stars)', 'error');
      return;
    }

    const reviewText = document.getElementById('reviewText').value.trim();
    if (!reviewText) {
      showToast('Please write your review thoughts', 'error');
      return;
    }

    try {
      const res = await api.post(`/reviews/${movieId}`, {
        rating: userRatingScore,
        review: reviewText,
      });

      if (res.success) {
        showToast('Review published! ⭐', 'success');
        document.getElementById('reviewText').value = '';
        userRatingScore = 0;
        updateStarDisplay(0);
        loadMovieDetails(movieId); // Refresh reviews
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    }
  });
}

function updateStarDisplay(score) {
  document.querySelectorAll('.star-rating-input i').forEach((star) => {
    const val = Number(star.dataset.value);
    if (val <= score) {
      star.className = 'fa-solid fa-star';
      star.style.color = '#fbbf24';
    } else {
      star.className = 'fa-regular fa-star';
      star.style.color = '#64748b';
    }
  });
}

function renderReviews(reviews) {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  if (!reviews || reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-reviews">
        <i class="fa-solid fa-comments"></i>
        <p>No community reviews yet. Be the first to share your thoughts!</p>
      </div>
    `;
    return;
  }

  const currentUser = api.getUser();

  container.innerHTML = reviews
    .map((rev) => {
      const isOwner = currentUser && currentUser.id === (rev.user?._id || rev.user);
      const stars = Array(5)
        .fill(0)
        .map((_, i) => `<i class="fa-solid fa-star ${i < rev.rating ? 'active-star' : 'dim-star'}"></i>`)
        .join('');
      const date = new Date(rev.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer-info">
              <img src="${rev.user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}" alt="${rev.user?.username}" class="user-avatar-sm">
              <div>
                <h4 class="reviewer-name">${escapeHtml(rev.user?.username || 'Movie Buff')}</h4>
                <span class="review-date">${date}</span>
              </div>
            </div>
            <div class="review-stars">${stars}</div>
          </div>
          <p class="review-body">${escapeHtml(rev.review)}</p>
          ${
            isOwner
              ? `<button class="btn-delete-review" onclick="handleDeleteReview('${rev._id}')">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>`
              : ''
          }
        </div>
      `;
    })
    .join('');
}

window.handleDeleteReview = async function (reviewId) {
  if (!confirm('Are you sure you want to delete your review?')) return;
  try {
    const res = await api.delete(`/reviews/${reviewId}`);
    if (res.success) {
      showToast('Review deleted', 'info');
      const urlParams = new URLSearchParams(window.location.search);
      loadMovieDetails(urlParams.get('id'));
    }
  } catch (err) {
    showToast(err.message || 'Failed to delete review', 'error');
  }
};

function renderSimilar(similarMovies) {
  const container = document.getElementById('similarMoviesGrid');
  if (!container || !similarMovies || similarMovies.length === 0) return;

  container.innerHTML = '';
  similarMovies.forEach((m) => {
    const card = createMovieCardElement(m);
    container.appendChild(card);
  });
}
