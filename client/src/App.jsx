import { createContext, useContext, useEffect, useState } from 'react';
import api from './api.js';

const AppContext = createContext(null);
const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
const defaultMovies = [
  { _id: '66d5b1a10001', title: 'Interstellar', description: 'A team travels beyond this galaxy to discover whether mankind has a future among the stars.', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg', genre: ['Sci-Fi', 'Adventure', 'Drama'], releaseDate: '2014-11-07', runtime: 169, rating: 8.7, trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E' },
  { _id: '66d5b1a10002', title: 'Dune: Part Two', description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg', genre: ['Sci-Fi', 'Adventure', 'Action'], releaseDate: '2024-03-01', runtime: 166, rating: 8.6, trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w' },
  { _id: '66d5b1a10003', title: 'The Dark Knight', description: 'Batman faces one of the greatest tests of his ability to fight injustice in Gotham City.', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg', genre: ['Action', 'Crime', 'Drama'], releaseDate: '2008-07-18', runtime: 152, rating: 9, trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY' },
  { _id: '66d5b1a10004', title: 'Oppenheimer', description: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rLb2cw6PxLwqxZE8DXAN4bgHSxW.jpg', genre: ['Drama', 'History', 'Biography'], releaseDate: '2023-07-21', runtime: 180, rating: 8.9, trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg' },
  { _id: '66d5b1a10005', title: 'Spider-Man: Across the Spider-Verse', description: 'Miles Morales encounters a team of Spider-People charged with protecting the multiverse.', poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', backdrop: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg', genre: ['Animation', 'Action', 'Adventure'], releaseDate: '2023-06-02', runtime: 140, rating: 8.7, trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg' },
  { _id: '66d5b1a10006', title: 'Inception', description: 'A thief is given the inverse task of planting an idea in the mind of a CEO.', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', backdrop: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', genre: ['Action', 'Sci-Fi', 'Adventure'], releaseDate: '2010-07-16', runtime: 148, rating: 8.8, trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0' },
];
const genres = [
  { genre: 'Action', icon: 'fa-burst', count: 12 },
  { genre: 'Sci-Fi', icon: 'fa-rocket', count: 9 },
  { genre: 'Drama', icon: 'fa-masks-theater', count: 15 },
  { genre: 'Adventure', icon: 'fa-compass', count: 11 },
  { genre: 'Animation', icon: 'fa-wand-magic-sparkles', count: 7 },
  { genre: 'Crime', icon: 'fa-handcuffs', count: 8 },
];
const statusLabels = {
  want_to_watch: ['Want to Watch', 'badge-blue'],
  watching: ['Watching', 'badge-amber'],
  watched: ['Watched', 'badge-emerald'],
  dropped: ['Dropped', 'badge-rose'],
};

function useApp() {
  return useContext(AppContext);
}

function Icon({ name, regular = false }) {
  return <i className={`${regular ? 'fa-regular' : 'fa-solid'} ${name}`} aria-hidden="true" />;
}

function App() {
  const [user, setUser] = useState(api.getUser());
  const [theme, setTheme] = useState(localStorage.getItem('mfy_theme') || 'dark');
  const [toast, setToast] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [addMovieOpen, setAddMovieOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mfy_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = 'info') => setToast({ message, type, id: Date.now() });
  const signOut = () => {
    api.clearSession();
    setUser(null);
    notify('Signed out successfully. See you soon!', 'info');
    window.setTimeout(() => { window.location.href = 'index.html'; }, 500);
  };
  const addToWatchlist = async (movieId, status = 'want_to_watch') => {
    if (!user) {
      notify('Please sign in to manage your watchlist', 'error');
      window.setTimeout(() => { window.location.href = 'login.html'; }, 900);
      return null;
    }
    try {
      const response = await api.post('/watchlist', { movieId, status });
      notify(response.message || 'Movie added to your watchlist', 'success');
      return response;
    } catch (error) {
      notify(error.message || 'Failed to add to watchlist', 'error');
      return null;
    }
  };
  const toggleFavorite = async (movieId) => {
    if (!user) {
      notify('Please sign in to add to favorites', 'error');
      window.setTimeout(() => { window.location.href = 'login.html'; }, 900);
      return null;
    }
    try {
      const response = await api.post(`/favorites/${movieId}`);
      notify(response.message, 'success');
      return response;
    } catch (error) {
      notify(error.message || 'Failed to update favorite', 'error');
      return null;
    }
  };
  const context = {
    user,
    setUser,
    theme,
    setTheme,
    notify,
    signOut,
    addToWatchlist,
    toggleFavorite,
    playTrailer: (movie) => movie?.trailerUrl
      ? setTrailer({ title: movie.title, url: movie.trailerUrl })
      : notify('Trailer not available for this movie', 'info'),
    openAddMovie: () => setAddMovieOpen(true),
  };
  const route = window.location.pathname.replace(/\/$/, '') || '/';
  useEffect(() => {
    const titles = {
      '/': 'MovForYou — Your Movies. Your Mood. Your Watchlist.',
      '/index.html': 'MovForYou — Your Movies. Your Mood. Your Watchlist.',
      '/movies.html': 'Explore Movies | MovForYou',
      '/movie-details.html': 'Movie Details | MovForYou',
      '/watchlist.html': 'My Watchlist | MovForYou',
      '/favorites.html': 'My Favorites | MovForYou',
      '/dashboard.html': 'User Dashboard | MovForYou',
      '/login.html': 'Sign In | MovForYou',
      '/register.html': 'Join MovForYou | Create Account',
      '/profile.html': 'User Profile | MovForYou',
    };
    document.title = titles[route] || 'Page Not Found | MovForYou';
  }, [route]);
  const page = route === '/' || route.endsWith('/index.html') ? <HomePage />
    : route.endsWith('/movies.html') ? <MoviesPage />
      : route.endsWith('/movie-details.html') ? <MovieDetailsPage />
        : route.endsWith('/watchlist.html') ? <WatchlistPage />
          : route.endsWith('/favorites.html') ? <FavoritesPage />
            : route.endsWith('/dashboard.html') ? <DashboardPage />
              : route.endsWith('/login.html') ? <AuthPage mode="login" />
                : route.endsWith('/register.html') ? <AuthPage mode="register" />
                  : route.endsWith('/profile.html') ? <ProfilePage />
                    : <NotFoundPage />;

  return (
    <AppContext.Provider value={context}>
      <Header />
      {page}
      {!['/login.html', '/register.html'].includes(route) && <Footer />}
      <div id="toastContainer" className="toast-container" aria-live="polite">
        {toast && <div key={toast.id} className={`toast ${toast.type}`}><Icon name={toast.type === 'success' ? 'fa-circle-check' : toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'} /><span>{toast.message}</span></div>}
      </div>
      {trailer && <TrailerModal trailer={trailer} onClose={() => setTrailer(null)} />}
      {addMovieOpen && <AddMovieModal onClose={() => setAddMovieOpen(false)} />}
    </AppContext.Provider>
  );
}

function Header() {
  const { user, theme, setTheme, signOut, openAddMovie } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const onScroll = () => document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const searchMovies = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) window.location.href = `movies.html?search=${encodeURIComponent(query)}`;
  };
  const links = [
    ['index.html', 'fa-house', 'Home'],
    ['movies.html', 'fa-film', 'Movies'],
    ['watchlist.html', 'fa-bookmark', 'Watchlist'],
    ['favorites.html', 'fa-heart', 'Favorites'],
    ['dashboard.html', 'fa-chart-pie', 'Dashboard'],
  ];
  const current = window.location.pathname;

  return (
    <header className="navbar">
      <div className="nav-container">
        <a href="index.html" className="brand-logo"><div className="logo-badge"><Icon name="fa-play" /></div><div className="brand-name">Mov<span>ForYou</span></div></a>
        <nav><ul className={`nav-menu ${mobileOpen ? 'mobile-active' : ''}`}>
          {links.map(([href, icon, label]) => <li key={href}><a href={href} className={`nav-link ${current.endsWith(href) || (href === 'index.html' && current === '/') ? 'active' : ''}`}><Icon name={icon} /> {label}</a></li>)}
        </ul></nav>
        <div className="nav-actions">
          <form className="nav-search" onSubmit={searchMovies}><Icon name="fa-magnifying-glass" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search movies, cast..." autoComplete="off" aria-label="Search movies" /></form>
          <button type="button" className="theme-btn" title="Toggle light/dark theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'fa-sun' : 'fa-moon'} /></button>
          <div className="nav-user-container">
            <div className="nav-auth-actions">
              <button type="button" className="btn btn-primary btn-sm" aria-label="Add Movie" onClick={openAddMovie}><Icon name="fa-plus" /><span className="add-movie-label"> Add Movie</span></button>
              {user ? <><a href="profile.html" className="user-profile-btn" title="View profile"><img src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username || 'User')}`} alt="" className="user-avatar-sm" /><span>{user.username}</span></a><button type="button" className="btn btn-secondary btn-sm" onClick={signOut}><Icon name="fa-right-from-bracket" /> Logout</button></> : <><a href="login.html" className="btn btn-secondary btn-sm"><Icon name="fa-right-to-bracket" /> Sign In</a><a href="register.html" className="btn btn-secondary btn-sm"><Icon name="fa-user-plus" /> Register</a></>}
            </div>
          </div>
          <button type="button" className="theme-btn mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"><Icon name={mobileOpen ? 'fa-xmark' : 'fa-bars'} /></button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="footer"><div className="footer-container">
    <div className="footer-brand"><a href="index.html" className="brand-logo"><div className="logo-badge"><Icon name="fa-play" /></div><div className="brand-name">Mov<span>ForYou</span></div></a><p>Your Movies. Your Mood. Your Watchlist. Discover, track, review, and organize the movies you love.</p></div>
    <div className="footer-col"><h4>Explore</h4><ul className="footer-links"><li><a href="index.html">Home</a></li><li><a href="movies.html">All Movies</a></li><li><a href="movies.html?genre=Sci-Fi">Sci-Fi Cinema</a></li><li><a href="movies.html?genre=Action">Action &amp; Adventure</a></li></ul></div>
    <div className="footer-col"><h4>Personal</h4><ul className="footer-links"><li><a href="watchlist.html">My Watchlist</a></li><li><a href="favorites.html">Favorites</a></li><li><a href="dashboard.html">Analytics Dashboard</a></li><li><a href="profile.html">Profile Settings</a></li></ul></div>
    <div className="footer-col"><h4>Platform</h4><ul className="footer-links"><li><a href="login.html">Sign In</a></li><li><a href="register.html">Create Account</a></li><li><a rel="noreferrer" href="https://github.com/skit-devops-2026/devops-24ESKCS114.git" target="_blank">GitHub Repository</a></li></ul></div>
  </div><div className="footer-bottom"><p>© 2026 MovForYou. Built with React, Express &amp; MongoDB.</p><p>Designed with <Icon name="fa-heart" /> for movie lovers.</p></div></footer>;
}

function MovieCard({ movie, favorite = false, onFavoriteChange, listMode = false }) {
  const { addToWatchlist, toggleFavorite } = useApp();
  const [isFavorite, setIsFavorite] = useState(favorite);
  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : '2024';
  const genre = Array.isArray(movie.genre) && movie.genre.length ? movie.genre[0] : 'Action';
  const handleFavorite = async (event) => {
    event.stopPropagation();
    const response = await toggleFavorite(movie._id);
    if (response?.success) {
      setIsFavorite(response.isFavorite);
      onFavoriteChange?.(response.isFavorite);
    }
  };
  return <article className={`movie-card ${listMode ? 'list-view' : ''}`}>
    <div className="card-poster-wrap"><a href={`movie-details.html?id=${movie._id}`} aria-label={`View ${movie.title}`}><img src={movie.poster || fallbackPoster} alt={movie.title} className="card-poster" loading="lazy" /></a>
      <button type="button" className={`card-favorite-btn ${isFavorite ? 'active' : ''}`} title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} onClick={handleFavorite}><Icon name="fa-heart" regular={!isFavorite} /></button>
      <div className="card-rating-badge"><Icon name="fa-star" /> {Number(movie.rating || 0).toFixed(1)}</div>
    </div>
    <div className="card-body"><div className="card-meta"><span className="card-genre">{genre}</span><span>{year}</span></div><h3 className="card-title" title={movie.title}>{movie.title}</h3>
      <div className="card-actions"><button type="button" onClick={() => addToWatchlist(movie._id)} title="Add to Watchlist"><Icon name="fa-plus" /> Watchlist</button><a href={`movie-details.html?id=${movie._id}`} title="View Details"><Icon name="fa-circle-info" /> Details</a></div>
    </div>
  </article>;
}

function MovieCards({ movies, empty = 'No movies found.', listMode = false, favorites = false, onFavoriteChange }) {
  if (!movies?.length) return <div className="empty-hint">{empty}</div>;
  return movies.map((movie) => <MovieCard key={movie._id} movie={movie} favorite={favorites} listMode={listMode} onFavoriteChange={onFavoriteChange ? (isFavorite) => onFavoriteChange(movie._id, isFavorite) : undefined} />);
}

function HomePage() {
  const { addToWatchlist, playTrailer } = useApp();
  const [featured, setFeatured] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationTitle, setRecommendationTitle] = useState('Recommended For You');
  const [catalog, setCatalog] = useState(null);
  useEffect(() => {
    api.get('/movies/featured').then((response) => {
      if (response.success) {
        setCatalog({
          ...response,
          trending: response.trending?.length ? response.trending : defaultMovies,
          popular: response.popular?.length ? response.popular : defaultMovies,
          topRated: response.topRated?.length ? response.topRated : defaultMovies,
          newReleases: response.newReleases?.length ? response.newReleases : defaultMovies,
        });
      }
    }).catch(() => {}).finally(() => {
      setFeatured((current) => current || defaultMovies[0]);
      setCatalog((current) => current || { trending: defaultMovies, popular: defaultMovies, topRated: defaultMovies, newReleases: defaultMovies });
    });
    api.get('/recommendations').then((response) => {
      if (response.success) {
        setRecommendations(response.recommendations || []);
        setRecommendationTitle(response.anchorMovieTitle
          ? `Because you enjoyed "${response.anchorMovieTitle}"`
          : 'Top Picks for You');
      }
    }).catch(() => {});
  }, []);
  useEffect(() => {
    if (catalog?.hero) setFeatured(catalog.hero);
  }, [catalog]);
  const scroll = (id, direction) => document.getElementById(id)?.scrollBy({ left: direction * 480, behavior: 'smooth' });
  const sections = [
    ['trendingCarousel', 'Trending Now', 'fa-fire', 'newest', catalog?.trending],
    ['popularCarousel', 'Popular Movies', 'fa-star', 'rating', catalog?.popular],
    ['topRatedCarousel', 'Top Rated Masterpieces', 'fa-trophy', 'rating', catalog?.topRated],
    ['newReleasesCarousel', 'New Releases', 'fa-sparkles', 'year_desc', catalog?.newReleases],
  ];
  return <>
    <section className="hero-section" style={featured ? { backgroundImage: `url('${featured.backdrop || featured.poster || fallbackPoster}')` } : undefined}>
      <div className="hero-overlay" /><div className="container hero-content">
        {featured ? <><div className="hero-badges"><span className="badge-featured"><Icon name="fa-fire" /> Featured Premiere</span><span className="badge-rating-hero"><Icon name="fa-star" /> {Number(featured.rating || 0).toFixed(1)} IMDb</span><span className="badge-meta">{(featured.genre || []).join(' • ')}</span><span className="badge-meta">• {featured.releaseDate?.split('-')[0] || '2024'}</span><span className="badge-meta">• {featured.runtime || 120} min</span></div><h1 className="hero-title">{featured.title}</h1><p className="hero-description">{featured.description}</p><div className="hero-actions"><button type="button" className="btn btn-primary" onClick={() => addToWatchlist(featured._id)}><Icon name="fa-plus" /> Add to Watchlist</button>{featured.trailerUrl && <button type="button" className="btn btn-glass" onClick={() => playTrailer(featured)}><Icon name="fa-play" /> Watch Trailer</button>}<a href={`movie-details.html?id=${featured._id}`} className="btn btn-secondary"><Icon name="fa-circle-info" /> More Details</a></div></> : <div className="skeleton skeleton-hero" style={{ height: 320 }} />}
      </div>
    </section>
    <main className="container">
      {recommendations.length > 0 && <CarouselSection id="recommendationsCarousel" title={recommendationTitle} icon="fa-bullseye" movies={recommendations} onScroll={scroll} />}
      {sections.map(([id, title, icon, sort, movies]) => <CarouselSection key={id} id={id} title={title} icon={icon} sort={sort} movies={movies || []} onScroll={scroll} />)}
      <section><div className="section-header"><h2 className="section-title"><Icon name="fa-masks-theater" /> Explore By Genre</h2></div><div className="genre-grid">{genres.map((item) => <a key={item.genre} className="genre-card" href={`movies.html?genre=${encodeURIComponent(item.genre)}`}><div className="genre-icon"><Icon name={item.icon} /></div><div className="genre-name">{item.genre}</div><div className="genre-count">{item.count} movies</div></a>)}</div></section>
    </main>
  </>;
}

function CarouselSection({ id, title, icon, movies, sort, onScroll }) {
  return <section className="carousel-wrapper"><div className="section-header"><h2 className="section-title"><Icon name={icon} /> {title}</h2><a href={`movies.html${sort ? `?sortBy=${sort}` : ''}`} className="section-link">View All <Icon name="fa-arrow-right" /></a></div>
    <button type="button" title="Scroll left" className="carousel-btn prev" onClick={() => onScroll(id, -1)}><Icon name="fa-chevron-left" /></button><button type="button" title="Scroll right" className="carousel-btn next" onClick={() => onScroll(id, 1)}><Icon name="fa-chevron-right" /></button>
    <div id={id} className="movie-carousel">{movies.length ? <MovieCards movies={movies} /> : Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton skeleton-card" />)}</div>
  </section>;
}

function MoviesPage() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get('search') || '');
  const [genre, setGenre] = useState(params.get('genre') || 'All');
  const [ratingMin, setRatingMin] = useState('');
  const [language, setLanguage] = useState('All');
  const [sort, setSort] = useState(params.get('sortBy') || 'rating_desc');
  const [viewMode, setViewMode] = useState('grid');
  const [movies, setMovies] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const [sortBy, order] = sort === 'newest' ? ['newest', 'desc'] : sort.split('_');
      setLoading(true);
      setError('');
      api.get('/movies', { search: search.trim(), genre, ratingMin, language, sortBy, order, page: 1, limit: 24 })
        .then((response) => { setMovies(response.data || []); setCount(response.total || 0); })
        .catch(() => setError('Failed to load movies. Please try again.'))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [search, genre, ratingMin, language, sort]);
  const clear = () => { setSearch(''); setGenre('All'); setRatingMin(''); setLanguage('All'); setSort('rating_desc'); };
  return <main className="container"><div className="catalog-layout">
    <aside className="filter-panel"><div className="filter-panel-heading"><h3><Icon name="fa-sliders" /> Filters</h3><button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear All</button></div>
      <div className="filter-group"><label htmlFor="catalogSearch"><Icon name="fa-magnifying-glass" /> Search Title/Cast</label><input id="catalogSearch" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. Nolan, Batman..." /></div>
      <div className="filter-group"><label htmlFor="genreSelect"><Icon name="fa-masks-theater" /> Genre</label><select id="genreSelect" value={genre} onChange={(event) => setGenre(event.target.value)}>{['All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'].map((value) => <option key={value} value={value}>{value === 'All' ? 'All Genres' : value}</option>)}</select></div>
      <div className="filter-group"><label htmlFor="ratingRange"><Icon name="fa-star" /> Minimum Rating: <span className="rating-value">{ratingMin ? `${ratingMin}+ Stars` : 'Any'}</span></label><input id="ratingRange" type="range" min="0" max="9" step="0.5" value={ratingMin || 0} onChange={(event) => setRatingMin(event.target.value === '0' ? '' : event.target.value)} /></div>
      <div className="filter-group"><label htmlFor="languageSelect"><Icon name="fa-globe" /> Language</label><select id="languageSelect" value={language} onChange={(event) => setLanguage(event.target.value)}>{['All', 'English', 'Japanese', 'Korean', 'Spanish', 'French'].map((value) => <option key={value} value={value}>{value === 'All' ? 'All Languages' : value}</option>)}</select></div>
      <div className="filter-group"><label htmlFor="sortSelect"><Icon name="fa-arrow-down-short-wide" /> Sort By</label><select id="sortSelect" value={sort} onChange={(event) => setSort(event.target.value)}><option value="rating_desc">IMDb Rating (High to Low)</option><option value="rating_asc">IMDb Rating (Low to High)</option><option value="newest">Recently Added</option><option value="year_desc">Release Year (Newest)</option><option value="year_asc">Release Year (Oldest)</option><option value="title_asc">Title (A - Z)</option></select></div>
    </aside>
    <section><div className="catalog-header"><div><h1>Browse Movies</h1><span className="results-badge">{loading ? 'Loading movies...' : `${count} movies found`}</span></div><div className="view-toggle"><button type="button" className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} title="Grid View" onClick={() => setViewMode('grid')}><Icon name="fa-grip" /></button><button type="button" className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} title="List View" onClick={() => setViewMode('list')}><Icon name="fa-list" /></button></div></div>
      <div className={`catalog-grid ${viewMode === 'list' ? 'list-mode' : ''}`}>{loading ? Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton skeleton-card" />) : error ? <div className="error-msg">{error}</div> : movies.length ? <MovieCards movies={movies} listMode={viewMode === 'list'} /> : <div className="catalog-empty"><div><Icon name="fa-film" /></div><h3>No matching movies found</h3><p>Try adjusting your filters or search keywords.</p></div>}</div>
    </section>
  </div></main>;
}

function WatchlistPage() {
  const { user, notify } = useApp();
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('createdAt_desc');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => {
    setLoading(true);
    setError('');
    const [sortBy, order] = sort.split('_');
    api.get('/watchlist', { status: tab, sortBy: sortBy === 'rating' ? 'userRating' : 'createdAt', order })
      .then((response) => { setItems(response.data || []); setCounts(response.counts || {}); })
      .catch(() => setError('Failed to load watchlist. Please log in again.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { if (!user) { notify('Please sign in to view your watchlist', 'info'); window.setTimeout(() => { window.location.href = 'login.html'; }, 700); return; } load(); }, [tab, sort, user]);
  const updateStatus = async (id, status) => { try { await api.put(`/watchlist/${id}`, { status }); notify('Status updated!', 'success'); load(); } catch (error) { notify(error.message, 'error'); } };
  const remove = async (id) => { if (!window.confirm('Remove this movie from your watchlist?')) return; try { await api.delete(`/watchlist/${id}`); notify('Movie removed from watchlist', 'info'); load(); } catch (error) { notify(error.message, 'error'); } };
  const tabs = [['all', 'All', 'countAll'], ['want_to_watch', 'Want to Watch', 'countWant'], ['watching', 'Watching', 'countWatching'], ['watched', 'Watched', 'countWatched'], ['dropped', 'Dropped', 'countDropped']];
  return <main className="container watchlist-main"><div className="watchlist-header"><div><h1><Icon name="fa-bookmark" /> My Watchlist</h1><p>Organize and track your movie journey across categories</p></div><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="createdAt_desc">Recently Added</option><option value="createdAt_asc">Oldest Added</option><option value="rating_desc">User Rating</option></select></div>
    <div className="watchlist-tabs">{tabs.map(([value, label, countKey]) => <button key={value} type="button" className={`watchlist-tab-btn ${tab === value ? 'active' : ''}`} onClick={() => setTab(value)}>{label}<span className="tab-badge">{counts[value] || 0}</span></button>)}</div>
    <div className="watchlist-grid">{loading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton skeleton-card" />) : error ? <div className="error-msg">{error}</div> : items.filter((item) => item.movie).map((item) => <WatchlistCard key={item._id} item={item} onStatus={updateStatus} onRemove={remove} />)}</div>
    {!loading && !error && items.length === 0 && <div className="watchlist-empty"><div><Icon name="fa-clapperboard" /></div><h3>No movies in this category</h3><p>Explore our movie catalog to add titles to your watchlist!</p><a href="movies.html" className="btn btn-primary"><Icon name="fa-magnifying-glass" /> Explore Movies</a></div>}
  </main>;
}

function WatchlistCard({ item, onStatus, onRemove }) {
  const movie = item.movie;
  const [label, color] = statusLabels[item.status] || [item.status, 'badge-blue'];
  return <article className="movie-card"><div className="card-poster-wrap"><img src={movie.poster || fallbackPoster} alt={movie.title} className="card-poster" loading="lazy" /><span className={`badge-status-pill ${color}`}>{label}</span></div><div className="card-body"><h3 className="card-title">{movie.title}</h3><select className="watchlist-status-dropdown" value={item.status} onChange={(event) => onStatus(item._id, event.target.value)}>{Object.entries(statusLabels).map(([value, [text]]) => <option key={value} value={value}>{text}</option>)}</select><div className="card-actions"><a href={`movie-details.html?id=${movie._id}`} className="btn-sm"><Icon name="fa-circle-info" /> Details</a><button type="button" className="btn-danger btn-sm" title="Remove" onClick={() => onRemove(item._id)}><Icon name="fa-trash" /></button></div></div></article>;
}

function FavoritesPage() {
  const { user, notify } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) { notify('Please sign in to view your favorites', 'info'); window.setTimeout(() => { window.location.href = 'login.html'; }, 700); return; }
    api.get('/favorites').then((response) => setItems(response.data || [])).catch(() => setError('Failed to load favorites.')).finally(() => setLoading(false));
  }, [user]);
  const onFavoriteChange = (movieId, isFavorite) => { if (!isFavorite) setItems((current) => current.filter((item) => item.movie?._id !== movieId)); };
  return <main className="container favorites-main"><div className="favorites-header"><div><h1><Icon name="fa-heart" /> Favorite Movies</h1><p>Your handpicked hall of fame</p></div><span>{items.length} Favorites</span></div>
    <div className="favorites-grid">{loading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton skeleton-card" />) : error ? <div className="error-msg">{error}</div> : <MovieCards movies={items.map((item) => item.movie).filter(Boolean)} favorites onFavoriteChange={onFavoriteChange} empty="No favorites saved yet. Discover movies to add them here." />}</div>
  </main>;
}

function AuthPage({ mode }) {
  const { setUser, notify } = useApp();
  const isLogin = mode === 'login';
  const submit = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!isLogin && values.password !== values.confirmPassword) { notify('Passwords do not match', 'error'); return; }
    try {
      const response = await api.post(isLogin ? '/auth/login' : '/auth/register', isLogin ? { email: values.email, password: values.password } : { username: values.username.trim(), email: values.email.trim(), password: values.password, confirmPassword: values.confirmPassword });
      if (response.success) { api.setSession(response.token, response.user); setUser(response.user); notify(response.message || 'Welcome to MovForYou!', 'success'); window.setTimeout(() => { window.location.href = 'index.html'; }, 600); }
    } catch (error) { notify(error.message || (isLogin ? 'Login failed' : 'Registration failed'), 'error'); }
  };
  const demoLogin = async () => {
    try { const response = await api.post('/auth/demo'); api.setSession(response.token, response.user); setUser(response.user); notify('Logged in with Demo Account!', 'success'); window.setTimeout(() => { window.location.href = 'index.html'; }, 500); }
    catch (error) { notify(error.message || 'Demo login failed', 'error'); }
  };
  return <main className="auth-page"><section className="auth-card"><div className="auth-heading"><div className="logo-badge"><Icon name="fa-play" /></div><h1>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h1><p>{isLogin ? 'Sign in to sync your movie watchlist and reviews' : 'Track movies, write reviews & build your dream watchlist'}</p></div>
    <form onSubmit={submit}>{!isLogin && <AuthField name="username" label="Username" placeholder="e.g. CinemaBuff" minLength="3" />}
      <AuthField name="email" label="Email Address" type="email" placeholder="you@example.com" />
      <AuthField name="password" label="Password" type="password" placeholder={isLogin ? 'Your password' : 'Minimum 6 characters'} minLength="6" />
      {!isLogin && <AuthField name="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter password" minLength="6" />}
      <button type="submit" className="btn btn-primary auth-submit"><Icon name={isLogin ? 'fa-right-to-bracket' : 'fa-user-plus'} /> {isLogin ? 'Sign In' : 'Join MovForYou'}</button>
      {isLogin && <button type="button" className="btn btn-secondary auth-submit demo-login" onClick={demoLogin}><Icon name="fa-wand-magic-sparkles" /> One-Click Demo Login</button>}
    </form><p className="auth-switch">{isLogin ? "Don't have an account? " : 'Already have an account? '}<a href={isLogin ? 'register.html' : 'login.html'}>{isLogin ? 'Join MovForYou' : 'Sign In'}</a></p>
  </section></main>;
}

function AuthField({ name, label, type = 'text', placeholder, minLength }) {
  return <div className="auth-group"><label htmlFor={`auth-${name}`}>{label}</label><input id={`auth-${name}`} name={name} type={type} placeholder={placeholder} required minLength={minLength} autoComplete={name === 'password' ? 'current-password' : name === 'confirmPassword' ? 'new-password' : name} /></div>;
}

function ProfilePage() {
  const { user, setUser, notify, signOut } = useApp();
  const [profile, setProfile] = useState({ username: user?.username || '', email: user?.email || '', bio: user?.bio || '' });
  useEffect(() => { if (!user) { notify('Please sign in to manage your profile', 'info'); window.location.href = 'login.html'; } }, [user]);
  useEffect(() => { if (user) setProfile({ username: user.username || '', email: user.email || '', bio: user.bio || '' }); }, [user]);
  const submit = async (event) => {
    event.preventDefault();
    try { const response = await api.put('/auth/profile', { username: profile.username.trim(), bio: profile.bio.trim() }); if (response.success) { api.setSession(api.getToken(), response.user); setUser(response.user); notify('Profile updated successfully!', 'success'); } }
    catch (error) { notify(error.message || 'Failed to update profile', 'error'); }
  };
  if (!user) return null;
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' };
  return <main className="container profile-main"><section className="profile-panel"><div className="profile-heading"><img src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'} alt="Profile avatar" /><div><h1>Profile Settings</h1><p>Manage your public display name and cinema bio</p></div></div>
    <form onSubmit={submit}><div className="profile-field"><label htmlFor="profileUsername">Username</label><input id="profileUsername" required value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} style={inputStyle} /></div><div className="profile-field"><label htmlFor="profileEmail">Email (Read-Only)</label><input id="profileEmail" type="email" disabled value={profile.email} style={inputStyle} /></div><div className="profile-field"><label htmlFor="profileBio">Bio / Favorite Quote</label><textarea id="profileBio" rows="3" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} style={inputStyle} /></div><div className="profile-actions"><button type="submit" className="btn btn-primary"><Icon name="fa-floppy-disk" /> Save Profile</button><button type="button" className="btn btn-danger" onClick={signOut}><Icon name="fa-right-from-bracket" /> Sign Out</button></div></form>
  </section></main>;
}

function MovieDetailsPage() {
  const { user, notify, addToWatchlist, toggleFavorite, playTrailer } = useApp();
  const movieId = new URLSearchParams(window.location.search).get('id');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('want_to_watch');
  const [favorite, setFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const loadDetails = () => {
    if (!movieId) { window.location.href = 'movies.html'; return; }
    setLoading(true);
    api.get(`/movies/${movieId}`).then((response) => {
      setDetails(response);
      setStatus(response.userStatus?.watchlist || 'want_to_watch');
      setFavorite(Boolean(response.userStatus?.isFavorite));
      document.title = `${response.data.title} | MovForYou`;
    }).catch(() => setError('Movie not found.')).finally(() => setLoading(false));
  };
  useEffect(() => { loadDetails(); }, [movieId]);
  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) { notify('Please sign in to write a review', 'error'); window.setTimeout(() => { window.location.href = 'login.html'; }, 700); return; }
    if (!rating) { notify('Please select a star rating (1-5 stars)', 'error'); return; }
    if (!review.trim()) { notify('Please write your review thoughts', 'error'); return; }
    try { await api.post(`/reviews/${movieId}`, { rating, review: review.trim() }); notify('Review published!', 'success'); setReview(''); setRating(0); loadDetails(); }
    catch (error) { notify(error.message || 'Failed to submit review', 'error'); }
  };
  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try { await api.delete(`/reviews/${reviewId}`); notify('Review deleted', 'info'); loadDetails(); }
    catch (error) { notify(error.message || 'Failed to delete review', 'error'); }
  };
  if (loading) return <main className="container details-loading"><div className="skeleton skeleton-hero" /></main>;
  if (error || !details?.data) return <main className="container details-loading"><p className="error-msg">{error || 'Movie not found.'}</p><a className="btn btn-primary" href="movies.html">Browse Movies</a></main>;
  const movie = details.data;
  const reviews = details.reviews || [];
  const reviewsRating = details.avgUserRating ? `${details.avgUserRating} / 5 (${details.reviewCount} ${details.reviewCount === 1 ? 'review' : 'reviews'})` : 'No user reviews yet';
  return <>
    <section className="details-hero" style={{ backgroundImage: `url('${movie.backdrop || movie.poster || fallbackPoster}')` }}><div className="details-backdrop-overlay" /><div className="container"><div className="movie-details-grid"><div className="details-poster-card"><img src={movie.poster || fallbackPoster} alt={`${movie.title} poster`} /></div><div className="details-copy"><div className="movie-genres">{(movie.genre || []).map((item) => <span className="badge-genre" key={item}>{item}</span>)}</div><h1>{movie.title}</h1><div className="details-metadata"><span><Icon name="fa-calendar" /> {movie.releaseDate?.split('-')[0] || '2024'}</span><span><Icon name="fa-clock" /> {movie.runtime || 120} min</span><span><Icon name="fa-language" /> {movie.language || 'English'}</span><span className="imdb-rating"><Icon name="fa-star" /> {Number(movie.rating || 0).toFixed(1)} IMDb</span><span className="community-rating">{reviewsRating}</span></div>
        <div className="details-actions"><select value={status} onChange={(event) => { setStatus(event.target.value); addToWatchlist(movie._id, event.target.value); }}><option value="want_to_watch">Add to: Want to Watch</option><option value="watching">Watching</option><option value="watched">Watched</option><option value="dropped">Dropped</option></select><button type="button" className={`btn btn-secondary ${favorite ? 'active' : ''}`} onClick={async () => { const response = await toggleFavorite(movie._id); if (response?.success) setFavorite(response.isFavorite); }}><Icon name="fa-heart" regular={!favorite} /> {favorite ? 'Favorited' : 'Favorite'}</button>{movie.trailerUrl && <button type="button" className="btn btn-primary" onClick={() => playTrailer(movie)}><Icon name="fa-play" /> Watch Trailer</button>}</div>
        <h2>Storyline</h2><p className="movie-description">{movie.description}</p><p className="movie-director"><strong>Director:</strong> {movie.director || 'N/A'}</p><strong className="cast-label">Starring Cast</strong><div className="movie-cast-list">{(movie.cast || []).map((actor) => <span className="cast-pill" key={actor}><Icon name="fa-user" /> {actor}</span>)}</div>
      </div></div></div></section>
    <main className="container details-bottom"><section><h2><Icon name="fa-star" /> Community Ratings &amp; Reviews</h2><div className="review-form-card"><h3>Leave a Review</h3><p>Select your star rating and write your thoughts:</p><form onSubmit={submitReview}><div className="star-rating-input" onMouseLeave={() => setHoverRating(0)}>{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} aria-label={`${score} stars`} onMouseEnter={() => setHoverRating(score)} onClick={() => setRating(score)}><Icon name="fa-star" regular={score > (hoverRating || rating)} /></button>)}</div><textarea rows="3" value={review} onChange={(event) => setReview(event.target.value)} placeholder="What did you think of the cinematography, story, or acting?" required /><button type="submit" className="btn btn-primary btn-sm"><Icon name="fa-paper-plane" /> Post Review</button></form></div>
      {reviews.length ? reviews.map((item) => { const ownerId = item.user?._id || item.user; const isOwner = user && String(user.id || user._id) === String(ownerId); return <article className="review-card" key={item._id}><div className="review-header"><div className="reviewer-info"><img src={item.user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'} alt="" className="user-avatar-sm" /><div><h3 className="reviewer-name">{item.user?.username || 'Movie Buff'}</h3><span className="review-date">{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div></div><div className="review-stars">{[1, 2, 3, 4, 5].map((score) => <Icon key={score} name="fa-star" />).map((star, index) => <span key={index} className={index < item.rating ? 'active-star' : 'dim-star'}>{star}</span>)}</div></div><p className="review-body">{item.review}</p>{isOwner && <button type="button" className="btn-delete-review" onClick={() => deleteReview(item._id)}><Icon name="fa-trash" /> Delete</button>}</article>; }) : <div className="empty-reviews"><Icon name="fa-comments" /><p>No community reviews yet. Be the first to share your thoughts!</p></div>}
    </section><section><h2><Icon name="fa-film" /> More Like This</h2><div className="similar-movies-grid"><MovieCards movies={details.similar || []} empty="No similar movies found." /></div></section></main>
  </>;
}

function DashboardPage() {
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) { window.location.href = 'login.html'; return; }
    api.get('/dashboard').then(setData).catch(() => setError('Unable to load your dashboard.'));
  }, [user]);
  if (!user) return null;
  if (error) return <main className="container dashboard-main"><p className="error-msg">{error}</p></main>;
  const stats = data?.stats || {};
  const statItems = [['fa-clapperboard', 'In Watchlist', stats.totalWatchlist || 0, 'rgba(139, 92, 246, 0.15)', 'var(--accent-purple)'], ['fa-circle-check', 'Watched', stats.watched || 0, 'rgba(16, 185, 129, 0.15)', 'var(--accent-emerald)'], ['fa-bookmark', 'Want to Watch', stats.wantToWatch || 0, 'rgba(6, 182, 212, 0.15)', 'var(--accent-cyan)'], ['fa-play', 'Watching', stats.watching || 0, 'rgba(245, 158, 11, 0.15)', 'var(--accent-gold)'], ['fa-heart', 'Favorites', stats.favoritesCount || 0, 'rgba(244, 63, 94, 0.15)', 'var(--accent-rose)'], ['fa-star', 'Reviews Written', stats.reviewsCount || 0, 'rgba(251, 191, 36, 0.15)', '#fbbf24']];
  const genresData = data?.genreStats || [];
  const maxGenreCount = Math.max(1, ...genresData.map((item) => item.count));
  const completion = stats.totalWatchlist ? Math.round((stats.watched / stats.totalWatchlist) * 100) : 0;
  const activities = [...(data?.recentWatchlist || []).filter((item) => item.movie).map((item) => ({ icon: 'fa-bookmark', text: <>Added <strong>{item.movie.title}</strong> to <em>{item.status.replace(/_/g, ' ')}</em></>, date: new Date(item.updatedAt) })), ...(data?.recentReviews || []).filter((item) => item.movie).map((item) => ({ icon: 'fa-star', text: <>Rated <strong>{item.movie.title}</strong> {item.rating}/5</>, date: new Date(item.createdAt) }))].sort((a, b) => b.date - a.date).slice(0, 5);
  return <main className="container dashboard-main"><h1>Welcome back, {user.username}</h1><p className="dashboard-subtitle">Here is your personalized cinema journey and viewing analytics</p><div className="dash-stats-grid">{statItems.map(([icon, label, value, background, color]) => <div className="dash-stat-card" key={label}><div className="dash-icon" style={{ background, color }}><Icon name={icon} /></div><div><span>{label}</span><h2>{value}</h2></div></div>)}</div><div className="dash-grid-2cols"><section className="chart-panel"><h2><Icon name="fa-chart-column" /> Top Genres in Your Library</h2>{data && genresData.length ? genresData.slice(0, 6).map((item) => <div className="genre-bar-item" key={item.genre}><div className="bar-header"><span>{item.genre}</span><span>{item.count} movies</span></div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(item.count / maxGenreCount * 100)}%` }} /></div></div>) : data ? <p className="empty-hint">Add movies to your watchlist to see your genre preferences!</p> : <div className="skeleton skeleton-card" />}</section><section className="chart-panel"><h2><Icon name="fa-clock-rotate-left" /> Watchlist Completion</h2><div className="completion-summary"><strong>Completed Movies Rate</strong><span>{completion}%</span></div><div className="bar-track completion-track"><div className="bar-fill" style={{ width: `${completion}%` }} /></div><h3>Recent Activity</h3>{activities.length ? activities.map((activity, index) => <div className="activity-item" key={`${activity.date.toISOString()}-${index}`}><div className="activity-icon"><Icon name={activity.icon} /></div><div className="activity-info"><p>{activity.text}</p><span className="activity-time">{activity.date.toLocaleDateString()}</span></div></div>) : data ? <p className="empty-hint">No recent activity yet. Start exploring movies!</p> : <div className="skeleton skeleton-card" />}</section></div></main>;
}

function TrailerModal({ trailer, onClose }) {
  const embedUrl = trailer.url.includes('watch?v=') ? trailer.url.replace('watch?v=', 'embed/') : trailer.url;
  const src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`;
  return <div className="modal-overlay active" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-box modal-trailer"><div className="modal-header"><h2 className="modal-title"><Icon name="fa-play" /> {trailer.title} - Official Trailer</h2><button type="button" className="modal-close" onClick={onClose} aria-label="Close trailer"><Icon name="fa-xmark" /></button></div><div className="video-container"><iframe src={src} title={`${trailer.title} trailer`} allowFullScreen allow="autoplay; encrypted-media" /></div></div></div>;
}

function AddMovieModal({ onClose }) {
  const { user, notify } = useApp();
  const submit = async (event) => {
    event.preventDefault();
    if (!user) { notify('Please sign in to add movies', 'error'); window.location.href = 'login.html'; return; }
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const movie = { title: values.title.trim(), description: values.description.trim(), genre: values.genre ? values.genre.split(',').map((value) => value.trim()).filter(Boolean) : ['Action'], releaseDate: values.releaseDate || '2024-01-01', poster: values.poster.trim(), backdrop: values.poster.trim(), trailerUrl: values.trailerUrl.trim(), director: values.director.trim() || 'Director', rating: Number(values.rating) || 8 };
    try { await api.post('/movies', movie); notify('Movie added successfully!', 'success'); onClose(); window.setTimeout(() => window.location.reload(), 600); }
    catch (error) { notify(error.message || 'Failed to add movie', 'error'); }
  };
  return <div className="modal-overlay active" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-box add-movie-modal"><div className="modal-header"><h2 className="modal-title"><Icon name="fa-film" /> Add Movie to Platform</h2><button type="button" className="modal-close" onClick={onClose} aria-label="Close"><Icon name="fa-xmark" /></button></div><div className="modal-body"><form onSubmit={submit}><div className="add-movie-fields"><label>Movie Title *<input name="title" required placeholder="e.g. Inception, Avatar..." /></label><label className="wide-field">Storyline / Description *<textarea name="description" required rows="3" placeholder="Movie synopsis..." /></label><label>Genre<input name="genre" placeholder="Sci-Fi, Action" /></label><label>Release Date<input name="releaseDate" type="date" /></label><label>Poster Image URL<input name="poster" type="url" placeholder="https://..." /></label><label>YouTube Trailer URL<input name="trailerUrl" type="url" placeholder="https://www.youtube.com/embed/..." /></label><label>Director<input name="director" placeholder="Director Name" /></label><label>Rating (0-10)<input name="rating" type="number" min="0" max="10" step="0.1" defaultValue="8.5" /></label></div><div className="add-movie-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary"><Icon name="fa-plus" /> Save &amp; Publish</button></div></form></div></section></div>;
}

function NotFoundPage() {
  return <main className="container not-found-page"><p>404</p><h1>Page not found</h1><a href="index.html" className="btn btn-primary">Return Home</a></main>;
}

export default App;