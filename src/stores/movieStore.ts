import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getPopularMovies,
  searchMovies,
  discoverMovies,
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
  video?: boolean;
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
  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(1);
  const loadingMore = ref(false);
  const currentListType = ref<"popular" | "nowPlaying" | "topRated" | "search" | null>(null);
  
  // Search drawer and filter state
  const searchDrawerOpen = ref(false);
  const searchFilters = ref<{
    query?: string;
    genres?: number[];
    year?: number;
    vote_average_gte?: number;
    language?: string;
    runtime_min?: number;
    runtime_max?: number;
    release_date_from?: string;
    release_date_to?: string;
  }>({});
  const filteredResults = ref<Movie[]>([]);
  const filteredCurrentPage = ref(1);
  const filteredTotalPages = ref(1);
  const filteredLoadingMore = ref(false);
  const hasActiveFilters = ref(false);

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

  const fetchPopularMovies = async (reset: boolean = true) => {
    if (reset) {
      hasAttemptedFetch.value = true;
      currentPage.value = 1;
      currentListType.value = "popular";
      const cachedData = getCachedData<Movie[]>("popular:1");
      if (cachedData) {
        movies.value = cachedData;
        loading.value = false;
        totalPages.value = getCachedData<number>("popular:totalPages") || 1;
      } else {
        loading.value = true;
        movies.value = [];
        error.value = "";
      }
    }

    try {
      loading.value = true;
      error.value = "";
      const response = await getPopularMovies(currentPage.value);
      if (reset) {
        movies.value = response.results;
      } else {
        movies.value = [...movies.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(`popular:${response.page}`, response.results);
      setCachedData("popular:totalPages", response.totalPages);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch movies";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchNowPlayingMovies = async (reset: boolean = true) => {
    if (reset) {
      hasAttemptedFetch.value = true;
      currentPage.value = 1;
      currentListType.value = "nowPlaying";
      const cachedData = getCachedData<Movie[]>("nowPlaying:1");
      if (cachedData) {
        movies.value = cachedData;
        loading.value = false;
        totalPages.value = getCachedData<number>("nowPlaying:totalPages") || 1;
      } else {
        loading.value = true;
        movies.value = [];
        error.value = "";
      }
    }

    try {
      loading.value = true;
      error.value = "";
      const response = await getNowPlayingMovies(currentPage.value);
      if (reset) {
        movies.value = response.results;
      } else {
        movies.value = [...movies.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(`nowPlaying:${response.page}`, response.results);
      setCachedData("nowPlaying:totalPages", response.totalPages);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch movies";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTopRatedMovies = async (reset: boolean = true) => {
    if (reset) {
      hasAttemptedFetch.value = true;
      currentPage.value = 1;
      currentListType.value = "topRated";
      const cachedData = getCachedData<Movie[]>("topRated:1");
      if (cachedData) {
        movies.value = cachedData;
        loading.value = false;
        totalPages.value = getCachedData<number>("topRated:totalPages") || 1;
      } else {
        loading.value = true;
        movies.value = [];
        error.value = "";
      }
    }

    try {
      loading.value = true;
      error.value = "";
      const response = await getTopRatedMovies(currentPage.value);
      if (reset) {
        movies.value = response.results;
      } else {
        movies.value = [...movies.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(`topRated:${response.page}`, response.results);
      setCachedData("topRated:totalPages", response.totalPages);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch movies";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUpcomingMovies = async () => {
    await fetchWithCache(
      "upcoming",
      getUpcomingMovies,
      (data) => (movies.value = data)
    );
  };

  const searchMoviesAction = async (query: string, reset: boolean = true) => {
    if (!query.trim()) {
      searchResults.value = [];
      loading.value = false;
      hasAttemptedFetch.value = false;
      return;
    }

    if (reset) {
      hasAttemptedFetch.value = true;
      currentListType.value = "search";
      searchQuery.value = query;
      currentPage.value = 1;
    }

    const cacheKey = `search:${query.toLowerCase().trim()}:${currentPage.value}`;
    const cachedData = getCachedData<Movie[]>(cacheKey);
    
    if (cachedData && reset) {
      searchResults.value = cachedData;
      loading.value = false;
      totalPages.value = getCachedData<number>(`search:${query.toLowerCase().trim()}:totalPages`) || 1;
      return;
    }

    // Set loading and clear results BEFORE fetching to show skeleton
    if (reset) {
      loading.value = true;
      error.value = "";
      searchResults.value = [];
    } else {
      loadingMore.value = true;
    }

    try {
      const response = await searchMovies(query, currentPage.value);
      if (reset) {
        searchResults.value = response.results;
      } else {
        searchResults.value = [...searchResults.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(cacheKey, response.results);
      setCachedData(`search:${query.toLowerCase().trim()}:totalPages`, response.totalPages);
    } catch (err: any) {
      error.value = err.message || "Failed to search movies";
      throw err;
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
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

  const loadMoreMovies = async () => {
    if (loadingMore.value || loading.value) return;
    if (currentPage.value >= totalPages.value) return;
    if (!currentListType.value) return;

    loadingMore.value = true;
    currentPage.value += 1;

    try {
      if (currentListType.value === "popular") {
        await fetchPopularMovies(false);
      } else if (currentListType.value === "nowPlaying") {
        await fetchNowPlayingMovies(false);
      } else if (currentListType.value === "topRated") {
        await fetchTopRatedMovies(false);
      }
    } catch (err) {
      currentPage.value -= 1; // Revert page on error
      console.error("Failed to load more movies:", err);
    } finally {
      loadingMore.value = false;
    }
  };

  const toggleSearchDrawer = () => {
    searchDrawerOpen.value = !searchDrawerOpen.value;
  };

  const applyFilters = async (filters: {
    query?: string;
    genres?: number[];
    year?: number;
    vote_average_gte?: number;
    language?: string;
    runtime_min?: number;
    runtime_max?: number;
    release_date_from?: string;
    release_date_to?: string;
  }, reset: boolean = true) => {
    // Check if filters are active
    const isActive = !!(filters.query?.trim() || 
      (filters.genres && filters.genres.length > 0) || 
      filters.year || 
      (filters.vote_average_gte !== undefined && filters.vote_average_gte > 0) ||
      filters.language ||
      filters.runtime_min !== undefined ||
      filters.runtime_max !== undefined ||
      filters.release_date_from ||
      filters.release_date_to);
    
    hasActiveFilters.value = isActive;
    searchFilters.value = { ...filters };

    if (!isActive) {
      filteredResults.value = [];
      filteredCurrentPage.value = 1;
      filteredTotalPages.value = 1;
      return;
    }

    if (reset) {
      filteredCurrentPage.value = 1;
      filteredResults.value = [];
      loading.value = true;
      error.value = "";
    } else {
      filteredLoadingMore.value = true;
    }

    try {
      const response = await discoverMovies({
        ...filters,
        page: filteredCurrentPage.value,
      });

      if (reset) {
        filteredResults.value = response.results;
      } else {
        filteredResults.value = [...filteredResults.value, ...response.results];
      }
      
      filteredCurrentPage.value = response.page;
      filteredTotalPages.value = response.totalPages;
    } catch (err: any) {
      error.value = err.message || "Failed to apply filters";
      throw err;
    } finally {
      loading.value = false;
      filteredLoadingMore.value = false;
    }
  };

  const clearFilters = () => {
    searchFilters.value = {};
    filteredResults.value = [];
    filteredCurrentPage.value = 1;
    filteredTotalPages.value = 1;
    hasActiveFilters.value = false;
  };

  const loadMoreFilteredMovies = async () => {
    if (filteredLoadingMore.value || loading.value) return;
    if (filteredCurrentPage.value >= filteredTotalPages.value) return;
    if (!hasActiveFilters.value) return;

    filteredLoadingMore.value = true;
    filteredCurrentPage.value += 1;

    try {
      await applyFilters(searchFilters.value, false);
    } catch (err) {
      filteredCurrentPage.value -= 1; // Revert page on error
      console.error("Failed to load more filtered movies:", err);
    } finally {
      filteredLoadingMore.value = false;
    }
  };

  return {
    movies,
    loading,
    loadingMore,
    error,
    hasAttemptedFetch,
    searchQuery,
    searchResults,
    movieDetails,
    genres,
    configuration,
    currentPage,
    totalPages,
    currentListType,
    searchDrawerOpen,
    searchFilters,
    filteredResults,
    filteredCurrentPage,
    filteredTotalPages,
    filteredLoadingMore,
    hasActiveFilters,
    fetchPopularMovies,
    fetchNowPlayingMovies,
    fetchTopRatedMovies,
    fetchUpcomingMovies,
    searchMoviesAction,
    fetchMovieDetails,
    fetchGenres,
    fetchConfiguration,
    loadMoreMovies,
    toggleSearchDrawer,
    applyFilters,
    clearFilters,
    loadMoreFilteredMovies,
  };
});
