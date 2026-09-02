# 🎬 CineTrack - Full-Stack Movie Watchlist Application

A modern, responsive full-stack Movie Watchlist application built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express, and MongoDB (Mongoose)**.

---

## 🌟 Key Features

- **Full CRUD Functionality**: Add new movies, view movie list, edit details/status/rating/notes, and delete movies.
- **Dynamic Stats Bar**: Real-time counters for Total Movies, Plan to Watch, Currently Watching, Completed, and Average Rating.
- **Search & Filter**: Real-time title search, category filter by status (`Plan to Watch`, `Watching`, `Completed`), genre filter, and multi-field sorting (`Newest`, `Rating`, `Year`, `Title`).
- **Cinematic Responsive UI**: Sleek dark theme with smooth modal animations, poster image fallbacks, status badges, and toast notifications.
- **Robust REST API**: Modular Express routing with Mongoose schemas and full error handling.

---

## 📁 Project File Structure

```text
movie-watchlist-app/
├── package.json          # Node.js dependencies & scripts
├── .env.example          # Template for environment variables
├── .env                  # Your active environment configuration
├── .gitignore            # Files ignored by Git
├── server.js             # Express server & MongoDB connection
├── models/
│   └── Movie.js          # Mongoose schema & model for movies
├── routes/
│   └── movieRoutes.js    # RESTful API endpoints for movies
├── public/
│   ├── index.html        # Main frontend UI structure
│   ├── style.css         # Modern cinematic styling
│   └── app.js            # Frontend JavaScript & API integration
└── README.md             # Project documentation & guides
```

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Inside `.env`, configure your MongoDB connection string (see MongoDB setup below).

### Step 3: Start the Server
- **Production / Normal mode:**
  ```bash
  npm start
  ```
- **Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```

### Step 4: Open in Browser
Open your browser and navigate to:
```text
http://localhost:5000
```

---

## 🗄️ MongoDB Setup Guide

You can use either **MongoDB Atlas (Cloud - Recommended)** or **Local MongoDB**.

### Option A: MongoDB Atlas (Cloud - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create a Database** and choose the **M0 Free Cluster**.
3. Under **Security > Database Access**:
   - Create a database user with username (e.g. `admin`) and password.
4. Under **Security > Network Access**:
   - Click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** for development.
5. In the **Database Overview**, click **Connect > Drivers > Node.js**.
6. Copy the connection string and paste it into your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/moviewatchlist?retryWrites=true&w=majority
   ```
   *(Make sure to replace `<username>` and `<password>` with your actual database user credentials).*

---

### Option B: Local MongoDB Setup

1. Install MongoDB Community Edition:
   - **macOS (via Homebrew):**
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community
     brew services start mongodb-community
     ```
   - **Windows:**
     Download and install from [MongoDB Official Website](https://www.mongodb.com/try/download/community) and run MongoDB as a Service.
   - **Linux (Ubuntu/Debian):**
     ```bash
     sudo systemctl start mongod
     ```
2. In your `.env` file, set:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/moviewatchlist
   ```

---

## 🐙 Step-by-Step Guide to Push to GitHub

### 1. Initialize Git in the Project
```bash
cd movie-watchlist-app
git init
```

### 2. Add and Commit Your Files
```bash
git add .
git commit -m "Initial commit: Movie Watchlist full stack app"
```

### 3. Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name the repository (e.g., `movie-watchlist-app`).
3. Leave **"Initialize this repository with a README" unchecked**.
4. Click **Create repository**.

### 4. Link Local Repository and Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/movie-watchlist-app.git
git push -u origin main
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/movies` | Fetch all movies (supports `?search=`, `?status=`, `?genre=`, `?sortBy=`, `?order=`) |
| `GET` | `/api/movies/stats/summary` | Fetch dashboard counts and average rating |
| `GET` | `/api/movies/:id` | Fetch single movie details |
| `POST` | `/api/movies` | Add a new movie |
| `PUT` | `/api/movies/:id` | Update movie details, status, rating, or notes |
| `DELETE` | `/api/movies/:id` | Delete a movie from watchlist |
| `GET` | `/api/health` | Check API server & MongoDB connection health |
