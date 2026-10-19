# Movie Watchlist

## About

MovForYou is a movie discovery and watchlist application with a React frontend, Express API, and MongoDB-backed data layer. Users can browse and filter movies, maintain favorites and watchlists, write reviews, and view personal statistics.

| Roll No. | Name | GitHub username |
|---|---|---|
| 24ESKCS114 | Dishant Kumawat | dishant999k |

## Tech stack

- Frontend: React 19, Vite, JavaScript, CSS
- Backend: Node.js / Express
- Database: MongoDB / Mongoose

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A local MongoDB service or a MongoDB Atlas connection string

## First-time setup

1. Install dependencies:

	```sh
	npm install
	```

2. Configure MongoDB in the existing `.env` file at the project root. Set `MONGODB_URI` to your local database or Atlas connection string, and set `JWT_SECRET` to a private random value. The default local URI is `mongodb://127.0.0.1:27017/movforyou`.

3. Start MongoDB. For a local MongoDB installation, make sure its service is running before starting the app. With MongoDB Atlas, allow your current IP address in the cluster network access settings.

## Run locally

Start the backend and React development server together:

```sh
npm run dev
```

Open **http://localhost:5173**. Vite forwards `/api` requests to the Express backend on port `3000`.

To run the production build through Express instead:

```sh
npm start
```

Then open **http://localhost:3000**. The `start` command builds the React app before launching Express. You can also build it separately with `npm run build`.

## Tests and CI

```sh
npm test
```

The test command builds the React app, verifies the health endpoint and SPA routes (including the existing `.html` URLs), and checks that unknown API routes still return JSON 404 responses. Jenkins installs dependencies, builds the frontend, runs syntax checks and tests, then performs the existing health smoke test.

## Routes

- `/` or `/index.html` — Home
- `/movies.html` — Movie catalog and filters
- `/movie-details.html?id=<movieId>` — Movie details and reviews
- `/watchlist.html` — Watchlist
- `/favorites.html` — Favorites
- `/dashboard.html` — User dashboard
- `/login.html`, `/register.html`, `/profile.html` — Account pages
- `/api/health` — Application health status
