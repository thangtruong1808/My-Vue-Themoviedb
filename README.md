# Vue 3 + TypeScript + Vite - TMDB Movie & TV Shows App

A modern, responsive movie and TV shows database application built with Vue 3, TypeScript, Vite, and Tailwind CSS. This app integrates with The Movie Database (TMDB) API to provide a comprehensive browsing experience for both movies and TV shows.

## Features

### Movies
- **Display a list of popular movies**: Browse trending movies on the homepage.
- **Search for movies by title**: Real-time search with debounced input for efficient API calls.
- **View movie details**: Detailed view including poster, synopsis, release date, rating, and genres.
- **Display a list of now playing movies**: Current theatrical releases.
- **Display a list of top rated movies**: Highest-rated movies from TMDB.

### TV Shows
- **Display a list of popular TV shows**: Browse trending TV shows.
- **Search for TV shows by title**: Real-time search with debounced input for efficient API calls.
- **View TV show details**: Detailed view including poster, synopsis, first air date, rating, genres, seasons, and episodes.
- **Display on the air TV shows**: Currently airing TV shows.
- **Display a list of top rated TV shows**: Highest-rated TV shows from TMDB.

### General
- **Responsive Design**: Mobile-first approach using Tailwind CSS for seamless experience across devices.
- **Modern UI**: Clean, dark-themed interface with hover effects and smooth transitions.
- **State Management**: Pinia for centralized state handling.
- **Routing**: Vue Router for client-side navigation.
- **Performance Optimizations**: Caching, request deduplication, and stale-while-revalidate patterns.

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **API**: TMDB API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/my-vue-themoviedb.git
   cd my-vue-themoviedb
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your TMDB API key:

   ```
   VITE_API_ACCESS_TOKEN=your_tmdb_access_token_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── MovieCard.vue    # Individual movie card
│   ├── MovieList.vue    # Grid layout for movies
│   ├── TVCard.vue       # Individual TV show card
│   ├── TVList.vue       # Grid layout for TV shows
│   ├── ImageResizer.vue # Image resizing component
│   ├── MoviePoster.vue  # Movie poster component
│   └── Navbar.vue       # Navigation bar
├── services/            # API service functions
│   ├── MovieService.ts  # TMDB Movies API integration
│   └── TVService.ts     # TMDB TV Shows API integration
├── stores/              # Pinia stores
│   ├── movieStore.ts    # Movie state management
│   └── tvStore.ts       # TV Shows state management
├── views/               # Page components
│   ├── Home.vue         # Popular movies
│   ├── MovieDetails.vue # Movie detail page
│   ├── NowPlaying.vue   # Now playing movies
│   ├── Search.vue        # Search movies page
│   ├── TopRated.vue     # Top rated movies
│   ├── HomeTV.vue       # Popular TV shows
│   ├── OnTheAir.vue     # On the air TV shows
│   ├── TopRatedTV.vue   # Top rated TV shows
│   ├── SearchTV.vue     # Search TV shows page
│   └── TVDetails.vue   # TV show detail page
├── router/              # Vue Router configuration
│   └── index.ts
├── App.vue              # Root component
├── main.ts              # Application entry point
└── style.css            # Global styles with Tailwind
```

## API Integration

This app uses the TMDB API v3 for both Movies and TV Shows endpoints. You'll need to obtain an API access token from [TMDB](https://www.themoviedb.org/settings/api) and add it to your environment variables.

### API Endpoints Used

**Movies:**
- `/movie/popular` - Popular movies
- `/movie/now_playing` - Now playing movies
- `/movie/top_rated` - Top rated movies
- `/search/movie` - Search movies
- `/movie/{id}` - Movie details

**TV Shows:**
- `/tv/popular` - Popular TV shows
- `/tv/on_the_air` - On the air TV shows
- `/tv/top_rated` - Top rated TV shows
- `/search/tv` - Search TV shows
- `/tv/{id}` - TV show details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
