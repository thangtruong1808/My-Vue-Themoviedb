import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getPopularMovies,
  searchMovies,
  getMovie,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieGenres,
  getConfiguration,
} from "../services/MovieService";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  genres: { id: number; name: string }[];
}

interface Genre {
  id: number;
  name: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export type { Movie, Genre };

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

export const useMovieStore = defineStore("movie", () => {
  const movies = ref<Movie[]>([]);
  const loading = ref(false);
  const error = ref("");
  const hasAttemptedFetch = ref(false); // Track if we've attempted to fetch
  const searchQuery = ref("");
  const searchResults = ref<Movie[]>([]);
  const movieDetails = ref<Movie | null>(null);
  const genres = ref<Genre[]>([]);
  const configuration = ref<any>(null);

  // Cache storage
  const cache = ref<Map<string, CacheEntry<any>>>(new Map());
  
  // Request deduplication - track ongoing requests
  const ongoingRequests = ref<Map<string, Promise<any>>>(new Map());

  // Helper function to check if cache is valid
  const isCacheValid = (key: string): boolean => {
    const entry = cache.value.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_DURATION;
  };

  // Helper function to get cached data
  const getCachedData = <T>(key: string): T | null => {
    const entry = cache.value.get(key);
    if (entry && isCacheValid(key)) {
      return entry.data as T;
    }
    return null;
  };

  // Helper function to set cached data
  const setCachedData = <T>(key: string, data: T): void => {
    cache.value.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  // Generic fetch function with caching and deduplication
  const fetchWithCache = async <T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    updateRef: (data: T) => void
  ): Promise<T> => {
    // Check cache first - return immediately if valid
    const cachedData = getCachedData<T>(cacheKey);
    if (cachedData) {
      updateRef(cachedData);
      loading.value = false; // Ensure loading is false when showing cached data
      // Fetch fresh data in background (stale-while-revalidate)
      if (!ongoingRequests.value.has(cacheKey)) {
        const promise = fetchFn()
          .then((data) => {
            setCachedData(cacheKey, data);
            updateRef(data);
            return data;
          })
          .catch((err) => {
            console.error(`Background fetch failed for ${cacheKey}:`, err);
            // Don't update error state for background refresh failures
          })
          .finally(() => {
            ongoingRequests.value.delete(cacheKey);
          });
        ongoingRequests.value.set(cacheKey, promise);
      }
      return cachedData;
    }

    // Check if request is already in progress
    if (ongoingRequests.value.has(cacheKey)) {
      loading.value = true; // Show loading if request is in progress
      return ongoingRequests.value.get(cacheKey)!;
    }

    // Make new request - show loading state
    loading.value = true;
    error.value = "";
    const promise = fetchFn()
      .then((data) => {
        setCachedData(cacheKey, data);
        updateRef(data);
        return data;
      })
      .catch((err) => {
        error.value = err.message || "Failed to fetch data";
        throw err;
      })
      .finally(() => {
        loading.value = false;
        ongoingRequests.value.delete(cacheKey);
      });

    ongoingRequests.value.set(cacheKey, promise);
    return promise;
  };

  const fetchPopularMovies = async () => {
    hasAttemptedFetch.value = true;
    const cachedData = getCachedData<Movie[]>("popular");
    if (cachedData) {
      // If we have cached data, show it immediately
      movies.value = cachedData;
      loading.value = false;
    } else {
      // Set loading and clear movies BEFORE fetching to show skeleton
      loading.value = true;
      movies.value = [];
      error.value = "";
    }
    await fetchWithCache(
      "popular",
      getPopularMovies,
      (data) => (movies.value = data)
    );
  };

  const fetchNowPlayingMovies = async () => {
    hasAttemptedFetch.value = true;
    const cachedData = getCachedData<Movie[]>("nowPlaying");
    if (cachedData) {
      // If we have cached data, show it immediately
      movies.value = cachedData;
      loading.value = false;
    } else {
      // Set loading and clear movies BEFORE fetching to show skeleton
      loading.value = true;
      movies.value = [];
      error.value = "";
    }
    await fetchWithCache(
      "nowPlaying",
      getNowPlayingMovies,
      (data) => (movies.value = data)
    );
  };

  const fetchTopRatedMovies = async () => {
    hasAttemptedFetch.value = true;
    const cachedData = getCachedData<Movie[]>("topRated");
    if (cachedData) {
      // If we have cached data, show it immediately
      movies.value = cachedData;
      loading.value = false;
    } else {
      // Set loading and clear movies BEFORE fetching to show skeleton
      loading.value = true;
      movies.value = [];
      error.value = "";
    }
    await fetchWithCache(
      "topRated",
      getTopRatedMovies,
      (data) => (movies.value = data)
    );
  };

  const fetchUpcomingMovies = async () => {
    await fetchWithCache(
      "upcoming",
      getUpcomingMovies,
      (data) => (movies.value = data)
    );
  };

  const searchMoviesAction = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      loading.value = false;
      return;
    }

    const cacheKey = `search:${query.toLowerCase().trim()}`;
    const cachedData = getCachedData<Movie[]>(cacheKey);
    
    if (cachedData) {
      searchResults.value = cachedData;
      searchQuery.value = query;
      loading.value = false;
      // Background refresh
      if (!ongoingRequests.value.has(cacheKey)) {
        const promise = searchMovies(query)
          .then((data) => {
            setCachedData(cacheKey, data);
            searchResults.value = data;
            return data;
          })
          .catch((err) => {
            console.error("Background search failed:", err);
          })
          .finally(() => {
            ongoingRequests.value.delete(cacheKey);
          });
        ongoingRequests.value.set(cacheKey, promise);
      }
      return;
    }

    // Set loading and clear results BEFORE fetching to show skeleton
    loading.value = true;
    error.value = "";
    searchQuery.value = query;
    searchResults.value = [];

    if (ongoingRequests.value.has(cacheKey)) {
      try {
        const data = await ongoingRequests.value.get(cacheKey)!;
        searchResults.value = data;
      } catch (err) {
        error.value = "Failed to search movies";
      } finally {
        loading.value = false;
      }
      return;
    }

    const promise = searchMovies(query)
      .then((data) => {
        setCachedData(cacheKey, data);
        searchResults.value = data;
        return data;
      })
      .catch((err) => {
        error.value = err.message || "Failed to search movies";
        throw err;
      })
      .finally(() => {
        loading.value = false;
        ongoingRequests.value.delete(cacheKey);
      });

    ongoingRequests.value.set(cacheKey, promise);
    await promise;
  };

  const fetchMovieDetails = async (id: string) => {
    const cacheKey = `movie:${id}`;
    const cachedData = getCachedData<Movie>(cacheKey);
    if (!cachedData) {
      // Set loading and clear details BEFORE fetching to show loading state
      loading.value = true;
      movieDetails.value = null;
    }
    await fetchWithCache(
      cacheKey,
      () => getMovie(id),
      (data) => (movieDetails.value = data)
    );
  };

  const fetchGenres = async () => {
    const cacheKey = "genres";
    const cachedData = getCachedData<Genre[]>(cacheKey);
    if (cachedData) {
      genres.value = cachedData;
      // Background refresh
      if (!ongoingRequests.value.has(cacheKey)) {
        const promise = getMovieGenres()
          .then((data) => {
            setCachedData(cacheKey, data);
            genres.value = data;
            return data;
          })
          .catch((err) => {
            console.error("Failed to fetch genres:", err);
          })
          .finally(() => {
            ongoingRequests.value.delete(cacheKey);
          });
        ongoingRequests.value.set(cacheKey, promise);
      }
      return;
    }

    if (ongoingRequests.value.has(cacheKey)) {
      try {
        const data = await ongoingRequests.value.get(cacheKey)!;
        genres.value = data;
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
      return;
    }

    const promise = getMovieGenres()
      .then((data) => {
        setCachedData(cacheKey, data);
        genres.value = data;
        return data;
      })
      .catch((err) => {
        console.error("Failed to fetch genres:", err);
        throw err;
      })
      .finally(() => {
        ongoingRequests.value.delete(cacheKey);
      });

    ongoingRequests.value.set(cacheKey, promise);
    await promise;
  };

  const fetchConfiguration = async () => {
    const cacheKey = "configuration";
    const cachedData = getCachedData<any>(cacheKey);
    if (cachedData) {
      configuration.value = cachedData;
      // Configuration rarely changes, so we can skip background refresh
      return;
    }

    if (ongoingRequests.value.has(cacheKey)) {
      try {
        const data = await ongoingRequests.value.get(cacheKey)!;
        configuration.value = data;
      } catch (err) {
        console.error("Failed to fetch configuration:", err);
      }
      return;
    }

    const promise = getConfiguration()
      .then((data) => {
        setCachedData(cacheKey, data);
        configuration.value = data;
        return data;
      })
      .catch((err) => {
        console.error("Failed to fetch configuration:", err);
        throw err;
      })
      .finally(() => {
        ongoingRequests.value.delete(cacheKey);
      });

    ongoingRequests.value.set(cacheKey, promise);
    await promise;
  };

  return {
    movies,
    loading,
    error,
    hasAttemptedFetch,
    searchQuery,
    searchResults,
    movieDetails,
    genres,
    configuration,
    fetchPopularMovies,
    fetchNowPlayingMovies,
    fetchTopRatedMovies,
    fetchUpcomingMovies,
    searchMoviesAction,
    fetchMovieDetails,
    fetchGenres,
    fetchConfiguration,
  };
});
