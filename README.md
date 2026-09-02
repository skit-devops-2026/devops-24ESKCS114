# 🎬 MovForYou — Cinematic Movie Platform & Watchlist

> **“Your Movies. Your Mood. Your Watchlist.”**

**MovForYou** is a modern, production-grade full-stack movie platform and personal watchlist web application designed with a cinematic aesthetic, smooth micro-interactions, dark/light theme switching, custom video trailer modals, categorized watchlists, community reviews with 1-5 star ratings, a personalized recommendation engine, and an interactive analytics dashboard.

---

## 🌟 Key Features

- 🎭 **Cinematic Visual Identity**: Custom movie-reel logo, dark-mode glassmorphic cards, glowing borders, smooth hover animations, and light/dark theme toggle.
- 🍿 **Hero Premiere & Carousels**: Large backdrop hero banner with trailer player, horizontal scroll carousels for *Trending Now*, *Popular Blockbusters*, *Top Rated*, and *New Releases*.
- 🔍 **Advanced Search & Multi-Field Filtering**: Real-time debounced title/cast search, genre filtering, interactive minimum rating slider, language selector, and multi-option sorting.
- 🎬 **Rich Movie Details**: High-definition backdrop images, cast pills, director, synopsis, IMDb scores, and embedded YouTube trailer modal.
- 📋 **Categorized Watchlist**: Organize movies across 4 dedicated states:
  - 🎬 *Want to Watch*
  - ▶️ *Watching*
  - ✅ *Watched*
  - ❌ *Dropped*
- ❤️ **One-Click Favorites**: Instant optimistic heart toggle with persistent database storage.
- ⭐ **1-5 Star Ratings & Community Reviews**: Complete review system with star rating selectors, edit/delete controls for authors, and duplicate prevention.
- 🎯 **Recommendation System**: Rule-based recommendation engine analyzing user's watch history and preferred genres (*"Because you liked Interstellar..."*).
- 📊 **Analytics Dashboard**: Real-time stats, watchlist completion progress meter, genre distribution charts, and recent activity timeline.
- 🔐 **Secure Authentication**: User registration, login with JWT tokens & bcrypt password hashing, plus **One-Click Demo Guest Login**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Semantic HTML5, CSS3 (Glassmorphism, CSS Grid/Flexbox, Keyframe Animations), Vanilla JavaScript (ES6+ Fetch API, DOM Manipulation) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose (Schemas, Compound Indexes, Validation) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Icons & Fonts** | FontAwesome 6, Google Fonts (Plus Jakarta Sans) |

---

## 📁 Project Structure

```text
MovForYou/
├── server/
│   ├── server.js               # Express application entry & error handling
│   ├── config/
│   │   └── db.js               # MongoDB connection & auto-seeding
│   ├── data/
│   │   └── seedMovies.js       # Curated initial blockbuster catalog
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt & JWT
│   │   ├── Movie.js            # Movie metadata, posters, trailers & cast
│   │   ├── Watchlist.js        # Categorized watchlist statuses
│   │   ├── Favorite.js         # Unique user favorites
│   │   └── Review.js           # 1-5 Star ratings & user reviews
│   ├── middleware/
│   │   └── auth.js             # JWT Bearer token authentication
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── watchlistController.js
│   │   ├── favoriteController.js
│   │   ├── reviewController.js
│   │   ├── dashboardController.js
│   │   └── recommendationController.js
│   └── routes/                 # REST API endpoints
│
├── public/
│   ├── index.html              # Home page with Hero, Carousels & Recommendations
│   ├── movies.html             # Catalog & Advanced Filtering
│   ├── movie-details.html      # Movie Details, Trailer Modal & Reviews
│   ├── watchlist.html          # Categorized Watchlist tabs
│   ├── favorites.html          # Favorites Gallery
│   ├── dashboard.html          # Interactive Charts & Analytics
│   ├── login.html              # Sign In with One-Click Demo
│   ├── register.html           # Create Account
│   ├── profile.html            # Profile Settings & Bio
│   ├── 404.html                # Cinematic 404 Error Page
│   ├── css/
│   │   ├── style.css           # Core theme, glassmorphism, navbar & cards
│   │   ├── animations.css      # Skeletons, transitions & keyframes
│   │   └── responsive.css      # Mobile, tablet & desktop media queries
│   └── js/
│       ├── api.js              # Centralized API fetch client with JWT
│       ├── main.js             # Theme toggle, global modals & toast alerts
│       ├── home.js             # Home page hero & carousels
│       ├── movies.js           # Catalog search & filter logic
│       ├── movie-details.js    # Details, reviews & trailer playback
│       ├── watchlist.js        # Watchlist tabs & status changer
│       ├── favorites.js        # Favorites management
│       ├── dashboard.js        # Analytics & chart rendering
│       └── auth.js             # Authentication flows
│
├── .env.example
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/dishant999k/mw.git
cd mw
npm install
```

### 2. Configure Environment Variables
Create your `.env` file from the template:
```bash
cp .env.example .env
```

Inside `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/movforyou
JWT_SECRET=movforyou_ultra_secret_jwt_key_2026_production
```

### 3. Start the Server
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode:**
  ```bash
  npm run dev
  ```

### 4. Open in Browser
Visit **`http://localhost:3000`** in your browser.

---

## 🗄️ MongoDB Setup Guide

### Option A: MongoDB Atlas (Cloud - Free)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 cluster**.
3. Under **Security > Database Access**, create a user (e.g. `admin` / `password123`).
4. Under **Security > Network Access**, allow IP `0.0.0.0/0`.
5. Under **Connect > Drivers > Node.js**, copy your connection string and paste it into `.env`:
   ```env
   MONGODB_URI=mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/movforyou?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB
- **macOS:** `brew services start mongodb-community`
- In `.env`: `MONGODB_URI=mongodb://127.0.0.1:27017/movforyou`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in user with JWT token | No |
| `POST` | `/api/auth/demo` | One-click instant guest demo login | No |
| `GET` | `/api/auth/me` | Fetch current logged-in profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile username/bio | Yes |
| `GET` | `/api/movies` | Fetch all movies with search/filters/sorting | No |
| `GET` | `/api/movies/featured` | Fetch hero banner, trending & popular | No |
| `GET` | `/api/movies/:id` | Fetch single movie details, trailer & cast | Optional |
| `GET` | `/api/watchlist` | Get user watchlist by status (`want_to_watch`, `watching`, `watched`, `dropped`) | Yes |
| `POST` | `/api/watchlist` | Add / update movie status in watchlist | Yes |
| `DELETE` | `/api/watchlist/:id` | Remove movie from watchlist | Yes |
| `GET` | `/api/favorites` | Get user's favorited movies | Yes |
| `POST` | `/api/favorites/:movieId` | Toggle favorite state (add/remove) | Yes |
| `GET` | `/api/reviews/:movieId` | Get all community reviews for a movie | No |
| `POST` | `/api/reviews/:movieId` | Post 1-5 star review for a movie | Yes |
| `DELETE` | `/api/reviews/:id` | Delete own review | Yes |
| `GET` | `/api/dashboard` | Get personalized stats & genre charts | Yes |
| `GET` | `/api/recommendations` | Get personalized movie recommendations | Optional |

---

## 🐙 Git & GitHub Commands

```bash
git add .
git commit -m "Build MovForYou: Complete full-stack cinematic movie platform"
git push origin main
```
