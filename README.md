# Stream Mafia

A full-stack Netflix clone built with the MERN stack, powered by the TMDB API. Browse trending movies & TV shows, watch trailers, search for content, and... well, there might be more to discover if you know where to look. 👀

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## Features

- **Authentication** — Signup, login, logout with JWT-based session cookies
- **Browse Content** — Trending movies & TV shows fetched live from TMDB
- **Search** — Search movies, TV shows, and actors with persistent search history
- **Search History** — View and delete your past searches
- **Watch Page** — Trailers via YouTube, content details, and similar content recommendations
- **Responsive** — Fully responsive UI across mobile, tablet, and desktop
- **Easter Egg** — *See below*

---

## Easter Egg — The Secret Stream

Hidden inside the Watch Page is a secret streaming panel that most users will never find.

**How to unlock it:**

1. Navigate to any movie or TV show's watch page (`/watch/:id`)
2. Look at the **age rating badge** next to the release date — the `PG-13` or `18+` label
3. **Click it** — a discreet code dialog will appear
4. Enter your **10-digit secret code** (set via the `SECRET_CODE` environment variable)
5. A hidden streaming player will embed directly on the page 

**For TV shows**, once unlocked you get a season & episode picker before the stream loads. The streaming URL is **never exposed to the client** — it's proxied through a signed, time-limited JWT on the server (`/api/v1/stream/embed`), so the source stays completely hidden.

> The lock icon turns into an unlock icon on the rating badge once you're in. To close the panel, hit the ✕ in the stream header — or just navigate away.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router v7, Zustand, Tailwind CSS v4, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookies) + bcryptjs |
| Movie Data | TMDB API |
| Dev Tools | Vite, nodemon, ESLint |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- [TMDB API key](https://www.themoviedb.org/settings/api)

### 1. Clone the repo

```bash
git clone https://github.com/kiran-sai-hub/netflix.git
cd netflix
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=8000
DB_URL=mongodb://localhost:27017/netflix-clone
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
TMDB_API_KEY=your_tmdb_bearer_token
SECRET_CODE=1234567890
THE_STREAMING_URI=your.streaming.provider.com
```

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 8000) |
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `TMDB_API_KEY` | Your TMDB Bearer token (from API settings) |
| `SECRET_CODE` | The 10-digit code for the secret stream Easter egg |
| `THE_STREAMING_URI` | Domain of your streaming embed source (no `https://`) |

### 3. Install dependencies & run

**Development** (runs both backend with nodemon + frontend with Vite):

```bash
# Install root dependencies
npm install

# In a separate terminal — run the frontend dev server
cd frontend && npm install && npm run dev

# Back in root — run the backend
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

The build script installs all dependencies and bundles the frontend into `frontend/dist`, which Express then serves statically.

---

## Project Structure

```
netflix-clone/
├── api/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── envVars.js         # Environment variable loader
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── movie.controller.js
│   │   ├── tv.controller.js
│   │   ├── search.controller.js
│   │   └── stream.controller.js   # Secret stream logic
│   ├── middleware/
│   │   └── protectRoute.js    # JWT auth middleware
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── movie.routes.js
│   │   ├── tv.routes.js
│   │   ├── search.routes.js
│   │   └── stream.routes.js
│   ├── services/
│   │   └── tmdb.service.js    # TMDB API wrapper
│   ├── utils/
│   │   └── generateToken.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/        # Navbar, MovieSlider, skeletons
│       ├── hooks/             # useGetTrendingContent
│       ├── pages/             # Home, Watch, Search, History, Auth pages
│       ├── store/             # Zustand stores (auth, content)
│       └── utils/             # Constants, date helpers
└── package.json
```

---

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Route | Description |
|---|---|---|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Log in |
| `POST` | `/logout` | Log out (clears cookie) |
| `GET` | `/authCheck` | Verify current session |

### Movies — `/api/v1/movie` *(protected)*
| Method | Route | Description |
|---|---|---|
| `GET` | `/trending` | Random trending movie |
| `GET` | `/:id/trailers` | Trailers for a movie |
| `GET` | `/:id/details` | Movie details |
| `GET` | `/:id/similar` | Similar movies |
| `GET` | `/:category` | Movies by category (e.g. `popular`, `top_rated`) |

### TV Shows — `/api/v1/tv` *(protected)*
Same structure as movies.

### Search — `/api/v1/search` *(protected)*
| Method | Route | Description |
|---|---|---|
| `GET` | `/movie/:query` | Search movies |
| `GET` | `/tv/:query` | Search TV shows |
| `GET` | `/person/:query` | Search actors |
| `GET` | `/history` | Get search history |
| `DELETE` | `/history/:id` | Remove a history item |

### Stream — `/api/v1/stream` *(protected)*
| Method | Route | Description |
|---|---|---|
| `POST` | `/unlock` | Validate secret code, get stream token |
| `GET` | `/embed` | Server-side redirect to actual stream (token-gated) |

---

## How the Secret Stream Works (Under the Hood)

The streaming feature is designed so the actual embed source URL **never touches the client**:

1. Client sends `POST /api/v1/stream/unlock` with the secret code + content metadata
2. Server validates the code against `SECRET_CODE` env var
3. If valid, server mints a **short-lived JWT** (4h) containing `userId`, `contentId`, and `contentType` — and returns it
4. Client loads an `<iframe>` pointing to `GET /api/v1/stream/embed?t=<token>`
5. Server verifies the JWT, confirms it belongs to the requesting user, then **302 redirects** to the real streaming URL
6. The iframe follows the redirect — the client sees the player but never sees the origin URL

---

## Credits

- Movie data by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Built by **Sai Kiran**