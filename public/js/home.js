/**
 * MovForYou - Home Page Logic
 */

const DEFAULT_MOVIES = [
  {
    _id: "66d5b1a10001",
    title: "Interstellar",
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    releaseDate: "2014-11-07",
    runtime: 169,
    rating: 8.7,
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
  },
  {
    _id: "66d5b1a10002",
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg",
    genre: ["Sci-Fi", "Adventure", "Action"],
    releaseDate: "2024-03-01",
    runtime: 166,
    rating: 8.6,
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
  },
  {
    _id: "66d5b1a10003",
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
    genre: ["Action", "Crime", "Drama"],
    releaseDate: "2008-07-18",
    runtime: 152,
    rating: 9.0,
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
  },
  {
    _id: "66d5b1a10004",
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rLb2cw6PxLwqxZE8DXAN4bgHSxW.jpg",
    genre: ["Drama", "History", "Biography"],
    releaseDate: "2023-07-21",
    runtime: 180,
    rating: 8.9,
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
  },
  {
    _id: "66d5b1a10005",
    title: "Spider-Man: Across the Spider-Verse",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    genre: ["Animation", "Action", "Adventure"],
    releaseDate: "2023-06-02",
    runtime: 140,
    rating: 8.7,
    trailerUrl: "https://www.youtube.com/embed/cqGjhVJWtEg",
  },
  {
    _id: "66d5b1a10006",
    title: "Inception",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    genre: ["Action", "Sci-Fi", "Adventure"],
    releaseDate: "2010-07-16",
    runtime: 148,
    rating: 8.8,
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
  }
];

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedContent();
  loadRecommendations();
  loadGenreSummary();
});

async function loadFeaturedContent() {
  try {
    const res = await api.get('/movies/featured');
    if (res && res.success && res.hero) {
      renderHeroBanner(res.hero);
      renderCarousel('trendingCarousel', res.trending && res.trending.length > 0 ? res.trending : DEFAULT_MOVIES);
      renderCarousel('popularCarousel', res.popular && res.popular.length > 0 ? res.popular : DEFAULT_MOVIES);
      renderCarousel('topRatedCarousel', res.topRated && res.topRated.length > 0 ? res.topRated : DEFAULT_MOVIES);
      renderCarousel('newReleasesCarousel', res.newReleases && res.newReleases.length > 0 ? res.newReleases : DEFAULT_MOVIES);
      return;
    }
  } catch (err) {
    console.warn('Loading default cinematic catalog...', err);
  }

  // Guaranteed fallback rendering
  renderHeroBanner(DEFAULT_MOVIES[0]);
  renderCarousel('trendingCarousel', DEFAULT_MOVIES);
  renderCarousel('popularCarousel', DEFAULT_MOVIES);
  renderCarousel('topRatedCarousel', DEFAULT_MOVIES);
  renderCarousel('newReleasesCarousel', DEFAULT_MOVIES);
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
  } catch (err) {}
}

async function loadGenreSummary() {
  const grid = document.getElementById('genresGrid');
  if (!grid) return;

  const genres = [
    { genre: 'Action', icon: 'fa-burst', count: 12 },
    { genre: 'Sci-Fi', icon: 'fa-rocket', count: 9 },
    { genre: 'Drama', icon: 'fa-masks-theater', count: 15 },
    { genre: 'Adventure', icon: 'fa-compass', count: 11 },
    { genre: 'Animation', icon: 'fa-wand-magic-sparkles', count: 7 },
    { genre: 'Crime', icon: 'fa-handcuffs', count: 8 },
  ];

  grid.innerHTML = '';
  genres.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'genre-card';
    card.innerHTML = `
      <div class="genre-icon"><i class="fa-solid ${item.icon}"></i></div>
      <div class="genre-name">${escapeHtml(item.genre)}</div>
      <div class="genre-count">${item.count} movies</div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `movies.html?genre=${encodeURIComponent(item.genre)}`;
    });
    grid.appendChild(card);
  });
}
