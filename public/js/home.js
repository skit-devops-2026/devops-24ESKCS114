/**
 * MovForYou - Home Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedContent();
  loadRecommendations();
  loadGenreSummary();
});

async function loadFeaturedContent() {
  try {
    const res = await api.get('/movies/featured');
    if (res.success) {
      // 1. Render Hero Banner
      if (res.hero) {
        renderHeroBanner(res.hero);
      }

      // 2. Render Carousels
      renderCarousel('trendingCarousel', res.trending);
      renderCarousel('popularCarousel', res.popular);
      renderCarousel('topRatedCarousel', res.topRated);
      renderCarousel('newReleasesCarousel', res.newReleases);
    }
  } catch (err) {
    console.error('Error loading featured content:', err);
  }
}

function renderHeroBanner(hero) {
  const heroSection = document.getElementById('heroSection');
  if (!heroSection) return;

  const backdrop = hero.backdrop || hero.poster;
  heroSection.style.backgroundImage = `url('${backdrop}')`;

  const year = hero.releaseDate ? hero.releaseDate.split('-')[0] : '2024';
  const genres = Array.isArray(hero.genre) ? hero.genre.join(' • ') : hero.genre;

  heroSection.innerHTML = `
    <div class="hero-overlay"></div>
    <div class="container hero-content">
      <div class="hero-badges">
        <span class="badge-featured"><i class="fa-solid fa-fire"></i> Featured Premiere</span>
        <span class="badge-rating-hero"><i class="fa-solid fa-star"></i> ${Number(hero.rating).toFixed(1)} IMDb</span>
        <span class="badge-meta">${escapeHtml(genres)}</span>
        <span class="badge-meta">• ${escapeHtml(year)}</span>
        <span class="badge-meta">• ${hero.runtime || 120} min</span>
      </div>
      <h1 class="hero-title">${escapeHtml(hero.title)}</h1>
      <p class="hero-description">${escapeHtml(hero.description)}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="quickAddToWatchlist('${hero._id}')">
          <i class="fa-solid fa-plus"></i> Add to Watchlist
        </button>
        ${
          hero.trailerUrl
            ? `<button class="btn btn-glass" onclick="playTrailer('${escapeHtml(hero.title)}', '${hero.trailerUrl}')">
                <i class="fa-solid fa-play"></i> Watch Trailer
              </button>`
            : ''
        }
        <a href="movie-details.html?id=${hero._id}" class="btn btn-secondary">
          <i class="fa-solid fa-circle-info"></i> More Details
        </a>
      </div>
    </div>
  `;
}

function renderCarousel(elementId, movies) {
  const container = document.getElementById(elementId);
  if (!container || !movies || movies.length === 0) return;

  container.innerHTML = '';
  movies.forEach((movie) => {
    const card = createMovieCardElement(movie);
    container.appendChild(card);
  });
}

// Horizontal Carousel scroll arrows helper
window.scrollCarousel = function (carouselId, direction) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const scrollAmount = direction * 480;
  carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
};

async function loadRecommendations() {
  const section = document.getElementById('recommendationsSection');
  const container = document.getElementById('recommendationsCarousel');
  const anchorTitle = document.getElementById('recAnchorTitle');

  if (!container) return;

  try {
    const res = await api.get('/recommendations');
    if (res.success && res.recommendations && res.recommendations.length > 0) {
      if (anchorTitle) {
        anchorTitle.textContent = res.anchorMovieTitle ? `Because you enjoyed "${res.anchorMovieTitle}"` : 'Top Picks for You';
      }
      container.innerHTML = '';
      res.recommendations.forEach((movie) => {
        const card = createMovieCardElement(movie);
        container.appendChild(card);
      });
      if (section) section.style.display = 'block';
    }
  } catch (err) {
    console.error('Recommendations error:', err);
  }
}

async function loadGenreSummary() {
  const grid = document.getElementById('genresGrid');
  if (!grid) return;

  const genreIcons = {
    Action: 'fa-burst',
    Adventure: 'fa-compass',
    Animation: 'fa-wand-magic-sparkles',
    Comedy: 'fa-face-laugh-beam',
    Crime: 'fa-handcuffs',
    Documentary: 'fa-camera',
    Drama: 'fa-masks-theater',
    Fantasy: 'fa-dragon',
    Horror: 'fa-ghost',
    Mystery: 'fa-user-secret',
    Romance: 'fa-heart',
    'Sci-Fi': 'fa-rocket',
    Thriller: 'fa-skull',
    Western: 'fa-hat-cowboy',
  };

  try {
    const res = await api.get('/movies/genres/summary');
    if (res.success && res.genres) {
      grid.innerHTML = '';
      res.genres.forEach((item) => {
        const icon = genreIcons[item.genre] || 'fa-film';
        const card = document.createElement('div');
        card.className = 'genre-card';
        card.innerHTML = `
          <div class="genre-icon"><i class="fa-solid ${icon}"></i></div>
          <div class="genre-name">${escapeHtml(item.genre)}</div>
          <div class="genre-count">${item.count} movies</div>
        `;
        card.addEventListener('click', () => {
          window.location.href = `movies.html?genre=${encodeURIComponent(item.genre)}`;
        });
        grid.appendChild(card);
      });
    }
  } catch (err) {
    console.error('Error loading genres:', err);
  }
}
