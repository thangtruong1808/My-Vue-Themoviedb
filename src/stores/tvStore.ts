import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getPopularTVShows,
  searchTVShows,
  getTVShow,
  getOnTheAirTVShows,
  getTopRatedTVShows,
  getAiringTodayTVShows,
  getTVShowGenres,
  getConfiguration,
  getTVShowCredits,
  getTVShowImages,
  getTVShowVideos,
  getTVShowRecommendations,
  discoverTVShows,
} from "../services/TVService";

// Define the filter type locally to avoid import issues
type DiscoverTVFilters = {
  query?: string;
  genres?: number[];
  first_air_date_year?: number;
  vote_average_gte?: number;
  language?: string;
  runtime_min?: number;
  runtime_max?: number;
  first_air_date_from?: string;
  first_air_date_to?: string;
  page?: number;
};

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  overview: string;
  genres: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  original_language?: string;
  backdrop_path?: string;
  keywords?: {
    keywords: { id: number; name: string }[];
  };
  networks?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  created_by?: { id: number; name: string; profile_path: string | null }[];
  episode_run_time?: number[];
  in_production?: boolean;
  last_air_date?: string;
  next_episode_to_air?: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  } | null;
  origin_country?: string[];
  original_name?: string;
  popularity?: number;
  production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  tagline?: string;
  type?: string;
}

interface Genre {
  id: number;
  name: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export type { TVShow, Genre };

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

export const useTVStore = defineStore("tv", () => {
  const tvShows = ref<TVShow[]>([]);
  const loading = ref(false);
  const error = ref("");
  const hasAttemptedFetch = ref(false); // Track if we've attempted to fetch
  const searchQuery = ref("");
  const searchResults = ref<TVShow[]>([]);
  const tvShowDetails = ref<TVShow | null>(null);
  const tvShowCredits = ref<any>(null);
  const tvShowImages = ref<any>(null);
  const tvShowVideos = ref<any[]>([]);
  const tvShowRecommendations = ref<TVShow[]>([]);
  const genres = ref<Genre[]>([]);
  const configuration = ref<any>(null);
  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalResults = ref(0);
  const onTheAirTotalResults = ref(0);
  const topRatedTotalResults = ref(0);
  const searchTotalResults = ref(0);
  const loadingMore = ref(false);
  const currentListType = ref<"popular" | "onTheAir" | "topRated" | "search" | null>(null);
  // Search pagination state
  const searchCurrentPage = ref(1);
  const searchTotalPages = ref(1);
  
  // Search drawer and filter state
  const searchDrawerOpen = ref(false);
  const searchFilters = ref<{
    query?: string;
    genres?: number[];
    first_air_date_year?: number;
    vote_average_gte?: number;
    language?: string;
    runtime_min?: number;
    runtime_max?: number;
    first_air_date_from?: string;
    first_air_date_to?: string;
  }>({});
  const filteredResults = ref<TVShow[]>([]);
  const filteredCurrentPage = ref(1);
  const filteredTotalPages = ref(1);
  const filteredTotalResults = ref(0);
  const filteredLoadingMore = ref(false);
  
  const hasActiveFilters = computed(() => {
    const filters = searchFilters.value;
    return !!(
      filters.query?.trim() ||
      (filters.genres && filters.genres.length > 0) ||
      filters.first_air_date_year ||
      filters.vote_average_gte !== undefined ||
      filters.language ||
      filters.runtime_min !== undefined ||
      filters.runtime_max !== undefined ||
      filters.first_air_date_from ||
      filters.first_air_date_to
    );
  });

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

  const fetchPopularTVShows = async (reset: boolean = true) => {
    if (reset) {
      hasAttemptedFetch.value = true;
      currentPage.value = 1;
      currentListType.value = "popular";
      const cachedData = getCachedData<TVShow[]>("popular:1");
      if (cachedData) {
        tvShows.value = cachedData;
        loading.value = false;
        totalPages.value = getCachedData<number>("popular:totalPages") || 1;
        totalResults.value = getCachedData<number>("popular:totalResults") || 0;
      } else {
        loading.value = true;
        tvShows.value = [];
        error.value = "";
      }
    }

    try {
      loading.value = true;
      error.value = "";
      const response = await getPopularTVShows(currentPage.value);
      if (reset) {
        tvShows.value = response.results;
        totalResults.value = response.totalResults || 0;
      } else {
        tvShows.value = [...tvShows.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(`popular:${response.page}`, response.results);
      setCachedData("popular:totalPages", response.totalPages);
      if (reset) {
        setCachedData("popular:totalResults", response.totalResults || 0);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch TV shows";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOnTheAirTVShows = async (reset: boolean = true) => {
    if (reset) {
      hasAttemptedFetch.value = true;
      currentPage.value = 1;
      currentListType.value = "onTheAir";
      const cachedData = getCachedData<TVShow[]>("onTheAir:1");
      if (cachedData) {
        tvShows.value = cachedData;
        loading.value = false;
        totalPages.value = getCachedData<number>("onTheAir:totalPages") || 1;
        onTheAirTotalResults.value = getCachedData<number>("onTheAir:totalResults") || 0;
      } else {
        loading.value = true;
        tvShows.value = [];
        error.value = "";
      }
    }

    try {
      loading.value = true;
      error.value = "";
      const response = await getOnTheAirTVShows(currentPage.value);
      if (reset) {
        tvShows.value = response.results;
        onTheAirTotalResults.value = response.totalResults || 0;
      } else {
        tvShows.value = [...tvShows.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(`onTheAir:${response.page}`, response.results);
      setCachedData("onTheAir:totalPages", response.totalPages);
      if (reset) {
        setCachedData("onTheAir:totalResults", response.totalResults || 0);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch TV shows";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTopRatedTVShows = async (reset: boolean = true) => {
    if (reset) {
      hasAttemptedFetch.value = true;
      currentPage.value = 1;
      currentListType.value = "topRated";
      const cachedData = getCachedData<TVShow[]>("topRated:1");
      if (cachedData) {
        tvShows.value = cachedData;
        loading.value = false;
        totalPages.value = getCachedData<number>("topRated:totalPages") || 1;
        topRatedTotalResults.value = getCachedData<number>("topRated:totalResults") || 0;
      } else {
        loading.value = true;
        tvShows.value = [];
        error.value = "";
      }
    }

    try {
      loading.value = true;
      error.value = "";
      const response = await getTopRatedTVShows(currentPage.value);
      if (reset) {
        tvShows.value = response.results;
        topRatedTotalResults.value = response.totalResults || 0;
      } else {
        tvShows.value = [...tvShows.value, ...response.results];
      }
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      setCachedData(`topRated:${response.page}`, response.results);
      setCachedData("topRated:totalPages", response.totalPages);
      if (reset) {
        setCachedData("topRated:totalResults", response.totalResults || 0);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch TV shows";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAiringTodayTVShows = async () => {
    hasAttemptedFetch.value = true;
    const cachedData = getCachedData<TVShow[]>("airingToday");
    if (cachedData) {
      // If we have cached data, show it immediately
      tvShows.value = cachedData;
      loading.value = false;
    } else {
      // Set loading and clear tvShows BEFORE fetching to show skeleton
      loading.value = true;
      tvShows.value = [];
      error.value = "";
    }
    await fetchWithCache(
      "airingToday",
      getAiringTodayTVShows,
      (data) => (tvShows.value = data)
    );
  };

  const searchTVShowsAction = async (query: string, reset: boolean = true) => {
    if (!query.trim()) {
      searchResults.value = [];
      loading.value = false;
      searchCurrentPage.value = 1;
      searchTotalPages.value = 1;
      return;
    }

    if (reset) {
      searchCurrentPage.value = 1;
      currentListType.value = "search";
      searchQuery.value = query;
    }

    const cacheKey = `search:${query.toLowerCase().trim()}:${searchCurrentPage.value}`;
    const cachedData = getCachedData<TVShow[]>(cacheKey);
    
    if (cachedData && reset) {
      searchResults.value = cachedData;
      loading.value = false;
      searchTotalPages.value = getCachedData<number>(`search:${query.toLowerCase().trim()}:totalPages`) || 1;
      searchTotalResults.value = getCachedData<number>(`search:${query.toLowerCase().trim()}:totalResults`) || 0;
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
      const response = await searchTVShows(query, searchCurrentPage.value);
      if (reset) {
        searchResults.value = response.results;
      } else {
        searchResults.value = [...searchResults.value, ...response.results];
      }
      searchCurrentPage.value = response.page;
      searchTotalPages.value = response.totalPages;
      if (reset) {
        searchTotalResults.value = response.totalResults || 0;
      }
      setCachedData(cacheKey, response.results);
      setCachedData(`search:${query.toLowerCase().trim()}:totalPages`, response.totalPages);
      if (reset) {
        setCachedData(`search:${query.toLowerCase().trim()}:totalResults`, response.totalResults || 0);
      }
    } catch (err: any) {
      error.value = err.message || "Failed to search TV shows";
      throw err;
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  };

  const fetchTVShowDetails = async (id: string) => {
    const cacheKey = `tv:${id}`;
    const cachedData = getCachedData<TVShow>(cacheKey);
    if (!cachedData) {
      // Set loading and clear details BEFORE fetching to show loading state
      loading.value = true;
      tvShowDetails.value = null;
      tvShowCredits.value = null;
      tvShowImages.value = null;
      tvShowVideos.value = [];
      tvShowRecommendations.value = [];
    }
    await fetchWithCache(
      cacheKey,
      () => getTVShow(id),
      (data) => (tvShowDetails.value = data)
    );
    
    // Fetch credits, images, videos, and recommendations in parallel
    const creditsCacheKey = `tv:${id}:credits`;
    const imagesCacheKey = `tv:${id}:images`;
    
    await fetchWithCache(
      creditsCacheKey,
      () => getTVShowCredits(id),
      (data) => (tvShowCredits.value = data)
    ).catch((err) => {
      console.error("Failed to fetch TV show credits:", err);
    });
    
    await fetchWithCache(
      imagesCacheKey,
      () => getTVShowImages(id),
      (data) => (tvShowImages.value = data)
    ).catch((err) => {
      console.error("Failed to fetch TV show images:", err);
    });
    
    // Fetch videos
    const videosCacheKey = `tv:${id}:videos`;
    await fetchWithCache(
      videosCacheKey,
      () => getTVShowVideos(id),
      (data) => (tvShowVideos.value = data)
    ).catch((err) => {
      console.error("Failed to fetch TV show videos:", err);
    });
    
    // Fetch recommendations
    const recommendationsCacheKey = `tv:${id}:recommendations`;
    await fetchWithCache(
      recommendationsCacheKey,
      () => getTVShowRecommendations(id, 1),
      (data) => (tvShowRecommendations.value = data.results || [])
    ).catch((err) => {
      console.error("Failed to fetch TV show recommendations:", err);
    });
  };

  const fetchGenres = async () => {
    const cacheKey = "genres";
    const cachedData = getCachedData<Genre[]>(cacheKey);
    if (cachedData) {
      genres.value = cachedData;
      // Background refresh
      if (!ongoingRequests.value.has(cacheKey)) {
        const promise = getTVShowGenres()
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

    const promise = getTVShowGenres()
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

  const loadMoreTVShows = async () => {
    if (loadingMore.value || loading.value) return;
    if (currentPage.value >= totalPages.value) return;
    if (!currentListType.value) return;

    loadingMore.value = true;
    currentPage.value += 1;

    try {
      if (currentListType.value === "popular") {
        await fetchPopularTVShows(false);
      } else if (currentListType.value === "onTheAir") {
        await fetchOnTheAirTVShows(false);
      } else if (currentListType.value === "topRated") {
        await fetchTopRatedTVShows(false);
      }
    } catch (err) {
      currentPage.value -= 1; // Revert page on error
      console.error("Failed to load more TV shows:", err);
    } finally {
      loadingMore.value = false;
    }
  };

  const loadMoreSearchTVShows = async () => {
    if (loadingMore.value || loading.value) return;
    if (searchCurrentPage.value >= searchTotalPages.value) return;
    if (!searchQuery.value.trim()) return;

    loadingMore.value = true;
    searchCurrentPage.value += 1;

    try {
      await searchTVShowsAction(searchQuery.value, false);
    } catch (err) {
      searchCurrentPage.value -= 1; // Revert page on error
      console.error("Failed to load more search results:", err);
    } finally {
      loadingMore.value = false;
    }
  };

  const toggleSearchDrawer = () => {
    searchDrawerOpen.value = !searchDrawerOpen.value;
  };

  const applyFilters = async (filters: DiscoverTVFilters, reset: boolean = true) => {
    // Check if filters are active
    const isActive = !!(
      filters.query?.trim() ||
      (filters.genres && filters.genres.length > 0) ||
      filters.first_air_date_year ||
      (filters.vote_average_gte !== undefined && filters.vote_average_gte > 0) ||
      filters.language ||
      filters.runtime_min !== undefined ||
      filters.runtime_max !== undefined ||
      filters.first_air_date_from ||
      filters.first_air_date_to
    );
    
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
      const response = await discoverTVShows({
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
      if (reset) {
        filteredTotalResults.value = response.totalResults || 0;
      }
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
    filteredTotalResults.value = 0;
    hasActiveFilters.value = false;
  };

  // Computed property to get current totalResults based on list type
  const currentTotalResults = computed(() => {
    switch (currentListType.value) {
      case "popular":
        return totalResults.value;
      case "onTheAir":
        return onTheAirTotalResults.value;
      case "topRated":
        return topRatedTotalResults.value;
      case "search":
        return searchTotalResults.value;
      default:
        return 0;
    }
  });

  const loadMoreFilteredTVShows = async () => {
    if (filteredLoadingMore.value || loading.value) return;
    if (filteredCurrentPage.value >= filteredTotalPages.value) return;
    if (!hasActiveFilters.value) return;

    filteredLoadingMore.value = true;
    filteredCurrentPage.value += 1;

    try {
      await applyFilters(searchFilters.value, false);
    } catch (err) {
      filteredCurrentPage.value -= 1; // Revert page on error
      console.error("Failed to load more filtered TV shows:", err);
    } finally {
      filteredLoadingMore.value = false;
    }
  };

  return {
    tvShows,
    loading,
    loadingMore,
    error,
    hasAttemptedFetch,
    searchQuery,
    searchResults,
    tvShowDetails,
    tvShowCredits,
    tvShowImages,
    tvShowVideos,
    tvShowRecommendations,
    genres,
    configuration,
    currentPage,
    totalPages,
    totalResults,
    onTheAirTotalResults,
    topRatedTotalResults,
    searchTotalResults,
    currentListType,
    searchCurrentPage,
    searchTotalPages,
    searchDrawerOpen,
    searchFilters,
    filteredResults,
    filteredCurrentPage,
    filteredTotalPages,
    filteredTotalResults,
    filteredLoadingMore,
    hasActiveFilters,
    currentTotalResults,
    fetchPopularTVShows,
    fetchOnTheAirTVShows,
    fetchTopRatedTVShows,
    fetchAiringTodayTVShows,
    searchTVShowsAction,
    fetchTVShowDetails,
    fetchGenres,
    fetchConfiguration,
    loadMoreTVShows,
    loadMoreSearchTVShows,
    toggleSearchDrawer,
    applyFilters,
    clearFilters,
    loadMoreFilteredTVShows,
  };
});

