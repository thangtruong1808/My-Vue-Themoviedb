import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { discoverMovies, searchMovies } from "../services/MovieService";
import { discoverTVShows, searchTVShows } from "../services/TVService";
import { getMovieGenres } from "../services/MovieService";
import { getTVShowGenres } from "../services/TVService";
import type { Movie } from "../services/MovieService";
import type { TVShow } from "../services/TVService";
import type { Genre } from "../services/MovieService";

export type UnifiedSearchFilters = {
  type: 'movie' | 'tv';
  query?: string;
  genres?: number[];
  // Movie-specific
  year?: number;
  release_date_from?: string;
  release_date_to?: string;
  // TV-specific
  first_air_date_year?: number;
  first_air_date_from?: string;
  first_air_date_to?: string;
  // Common
  vote_average_gte?: number;
  language?: string;
  runtime_min?: number;
  runtime_max?: number;
};

export const useSearchStore = defineStore("search", () => {
  const router = useRouter();
  const route = useRoute();
  
  // Drawer state
  const searchDrawerOpen = ref(false);
  const selectedType = ref<'movie' | 'tv'>('movie');
  
  // Filter state
  const searchFilters = ref<UnifiedSearchFilters>({
    type: 'movie',
  });
  
  // Results state
  const filteredResults = ref<(Movie | TVShow)[]>([]);
  const filteredCurrentPage = ref(1);
  const filteredTotalPages = ref(1);
  const filteredTotalResults = ref(0);
  const filteredLoadingMore = ref(false);
  const loading = ref(false);
  const error = ref("");
  
  // Genres state
  const genres = ref<Genre[]>([]);
  const genresLoading = ref(false);
  
  // Computed
  const hasActiveFilters = computed(() => {
    const filters = searchFilters.value;
    return !!(
      filters.query?.trim() ||
      (filters.genres && filters.genres.length > 0) ||
      filters.year ||
      filters.first_air_date_year ||
      (filters.vote_average_gte !== undefined && filters.vote_average_gte > 0) ||
      filters.language ||
      filters.runtime_min !== undefined ||
      filters.runtime_max !== undefined ||
      filters.release_date_from ||
      filters.release_date_to ||
      filters.first_air_date_from ||
      filters.first_air_date_to
    );
  });
  
  // Methods
  const toggleSearchDrawer = () => {
    searchDrawerOpen.value = !searchDrawerOpen.value;
  };
  
  const setSelectedType = async (type: 'movie' | 'tv') => {
    selectedType.value = type;
    searchFilters.value.type = type;
    
    // Fetch genres for the selected type
    await fetchGenres();
    
    // Clear genres from filters when switching types
    if (searchFilters.value.genres) {
      searchFilters.value.genres = [];
    }
  };
  
  const fetchGenres = async () => {
    if (genresLoading.value) return;
    
    genresLoading.value = true;
    try {
      if (selectedType.value === 'movie') {
        const movieGenres = await getMovieGenres();
        genres.value = movieGenres;
      } else {
        const tvGenres = await getTVShowGenres();
        genres.value = tvGenres;
      }
    } catch (err: any) {
      console.error("Failed to fetch genres:", err);
      error.value = err.message || "Failed to fetch genres";
    } finally {
      genresLoading.value = false;
    }
  };
  
  const updateURL = (filters: UnifiedSearchFilters) => {
    const query: Record<string, string> = {};
    
    if (filters.type) query.type = filters.type;
    if (filters.query?.trim()) query.query = filters.query.trim();
    if (filters.genres && filters.genres.length > 0) {
      query.genres = filters.genres.join(',');
    }
    if (filters.year) query.year = filters.year.toString();
    if (filters.first_air_date_year) query.first_air_date_year = filters.first_air_date_year.toString();
    if (filters.vote_average_gte !== undefined) query.rating = filters.vote_average_gte.toString();
    if (filters.language) query.language = filters.language;
    if (filters.runtime_min !== undefined) query.runtime_min = filters.runtime_min.toString();
    if (filters.runtime_max !== undefined) query.runtime_max = filters.runtime_max.toString();
    if (filters.release_date_from) query.release_date_from = filters.release_date_from;
    if (filters.release_date_to) query.release_date_to = filters.release_date_to;
    if (filters.first_air_date_from) query.first_air_date_from = filters.first_air_date_from;
    if (filters.first_air_date_to) query.first_air_date_to = filters.first_air_date_to;
    
    // Update URL without navigation
    router.push({ query }).catch(() => {
      // Ignore navigation errors (e.g., same route)
    });
  };
  
  const parseURLParams = (): UnifiedSearchFilters | null => {
    const query = route.query;
    
    if (!query.type || (query.type !== 'movie' && query.type !== 'tv')) {
      return null;
    }
    
    const filters: UnifiedSearchFilters = {
      type: query.type as 'movie' | 'tv',
    };
    
    if (query.query && typeof query.query === 'string') {
      filters.query = query.query;
    }
    
    if (query.genres && typeof query.genres === 'string') {
      filters.genres = query.genres.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }
    
    if (query.year && typeof query.year === 'string') {
      const year = parseInt(query.year, 10);
      if (!isNaN(year)) filters.year = year;
    }
    
    if (query.first_air_date_year && typeof query.first_air_date_year === 'string') {
      const year = parseInt(query.first_air_date_year, 10);
      if (!isNaN(year)) filters.first_air_date_year = year;
    }
    
    if (query.rating && typeof query.rating === 'string') {
      const rating = parseFloat(query.rating);
      if (!isNaN(rating)) filters.vote_average_gte = rating;
    }
    
    if (query.language && typeof query.language === 'string') {
      filters.language = query.language;
    }
    
    if (query.runtime_min && typeof query.runtime_min === 'string') {
      const min = parseInt(query.runtime_min, 10);
      if (!isNaN(min)) filters.runtime_min = min;
    }
    
    if (query.runtime_max && typeof query.runtime_max === 'string') {
      const max = parseInt(query.runtime_max, 10);
      if (!isNaN(max)) filters.runtime_max = max;
    }
    
    if (query.release_date_from && typeof query.release_date_from === 'string') {
      filters.release_date_from = query.release_date_from;
    }
    
    if (query.release_date_to && typeof query.release_date_to === 'string') {
      filters.release_date_to = query.release_date_to;
    }
    
    if (query.first_air_date_from && typeof query.first_air_date_from === 'string') {
      filters.first_air_date_from = query.first_air_date_from;
    }
    
    if (query.first_air_date_to && typeof query.first_air_date_to === 'string') {
      filters.first_air_date_to = query.first_air_date_to;
    }
    
    return filters;
  };
  
  const applyFilters = async (filters: UnifiedSearchFilters, reset: boolean = true) => {
    // Check if filters are active before updating state
    const isActive = !!(
      filters.query?.trim() ||
      (filters.genres && filters.genres.length > 0) ||
      filters.year ||
      filters.first_air_date_year ||
      (filters.vote_average_gte !== undefined && filters.vote_average_gte > 0) ||
      filters.language ||
      filters.runtime_min !== undefined ||
      filters.runtime_max !== undefined ||
      filters.release_date_from ||
      filters.release_date_to ||
      filters.first_air_date_from ||
      filters.first_air_date_to
    );
    
    // Update filter state
    searchFilters.value = { ...filters };
    
    // Update selected type if changed
    if (selectedType.value !== filters.type) {
      selectedType.value = filters.type;
      await fetchGenres();
    }
    
    // Check if filters are active
    if (!isActive) {
      filteredResults.value = [];
      filteredCurrentPage.value = 1;
      filteredTotalPages.value = 1;
      filteredTotalResults.value = 0;
      // Clear URL params
      router.push({ query: {} }).catch(() => {});
      return;
    }
    
    // Update URL
    updateURL(filters);
    
    if (reset) {
      filteredCurrentPage.value = 1;
      filteredResults.value = [];
      loading.value = true;
      error.value = "";
    } else {
      filteredLoadingMore.value = true;
    }
    
    try {
      let response;
      
      if (filters.type === 'movie') {
        response = await discoverMovies({
          query: filters.query,
          genres: filters.genres,
          year: filters.year,
          vote_average_gte: filters.vote_average_gte,
          language: filters.language,
          runtime_min: filters.runtime_min,
          runtime_max: filters.runtime_max,
          release_date_from: filters.release_date_from,
          release_date_to: filters.release_date_to,
          page: filteredCurrentPage.value,
        });
      } else {
        // For TV: if query is provided, use search; otherwise use discover with filters
        // Note: TMDB search endpoint doesn't support combining query with other filters
        // So we prioritize query over other filters when query is present
        if (filters.query?.trim()) {
          // Query provided - use search endpoint (other filters will be ignored)
          response = await searchTVShows(filters.query.trim(), filteredCurrentPage.value);
        } else {
          // No query - use discover with all filters
          response = await discoverTVShows({
            genres: filters.genres,
            first_air_date_year: filters.first_air_date_year,
            vote_average_gte: filters.vote_average_gte,
            language: filters.language,
            runtime_min: filters.runtime_min,
            runtime_max: filters.runtime_max,
            first_air_date_from: filters.first_air_date_from,
            first_air_date_to: filters.first_air_date_to,
            page: filteredCurrentPage.value,
          });
        }
      }
      
      if (reset) {
        filteredResults.value = response.results as (Movie | TVShow)[];
        filteredTotalResults.value = response.totalResults || 0;
      } else {
        filteredResults.value = [...filteredResults.value, ...response.results as (Movie | TVShow)[]];
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
    searchFilters.value = {
      type: selectedType.value,
    };
    filteredResults.value = [];
    filteredCurrentPage.value = 1;
    filteredTotalPages.value = 1;
    filteredTotalResults.value = 0;
    error.value = "";
    
    // Clear URL params
    router.push({ query: {} }).catch(() => {});
  };
  
  const loadMoreFilteredResults = async () => {
    if (filteredLoadingMore.value || loading.value) return;
    if (filteredCurrentPage.value >= filteredTotalPages.value) return;
    if (!hasActiveFilters.value) return;
    
    filteredLoadingMore.value = true;
    filteredCurrentPage.value += 1;
    
    try {
      await applyFilters(searchFilters.value, false);
    } catch (err) {
      filteredCurrentPage.value -= 1;
      console.error("Failed to load more filtered results:", err);
    } finally {
      filteredLoadingMore.value = false;
    }
  };
  
  const initializeFromURL = async () => {
    const urlFilters = parseURLParams();
    if (urlFilters) {
      selectedType.value = urlFilters.type;
      await fetchGenres();
      await applyFilters(urlFilters, true);
    }
  };
  
  return {
    // State
    searchDrawerOpen,
    selectedType,
    searchFilters,
    filteredResults,
    filteredCurrentPage,
    filteredTotalPages,
    filteredTotalResults,
    filteredLoadingMore,
    loading,
    error,
    genres,
    genresLoading,
    // Computed
    hasActiveFilters,
    // Methods
    toggleSearchDrawer,
    setSelectedType,
    fetchGenres,
    applyFilters,
    clearFilters,
    loadMoreFilteredResults,
    initializeFromURL,
  };
});

