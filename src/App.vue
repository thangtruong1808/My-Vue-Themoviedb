<template>
  <div id="app">
    <router-view v-if="!shouldShowFilteredResults && !shouldShowFilteredTVResults || isDetailsPage" />
    <div v-else-if="shouldShowFilteredResults" class="min-h-screen bg-gray-900 text-white pb-32">
      <Navbar />
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">
            Filtered Movies
            <span v-if="filteredTotalResults > 0" class="text-xl font-normal text-gray-400 ml-2">
              ({{ filteredTotalResults.toLocaleString() }})
            </span>
          </h1>
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        <MovieList
          :movies="filteredResults"
          :loading="loading"
          :error="error"
          :has-attempted-fetch="true"
          :loading-more="filteredLoadingMore"
          :has-more="filteredCurrentPage < filteredTotalPages"
          :on-load-more="loadMoreFilteredMovies"
        />
      </div>
    </div>
    <div v-else-if="shouldShowFilteredTVResults" class="min-h-screen bg-gray-900 text-white pb-32">
      <Navbar />
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">
            Filtered TV Shows
            <span v-if="filteredTVTotalResults > 0" class="text-xl font-normal text-gray-400 ml-2">
              ({{ filteredTVTotalResults.toLocaleString() }})
            </span>
          </h1>
          <button
            @click="clearTVFilters"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        <TVList
          :tv-shows="filteredTVResults"
          :loading="tvLoading"
          :error="tvError"
          :has-attempted-fetch="true"
          :loading-more="filteredTVLoadingMore"
          :has-more="filteredTVCurrentPage < filteredTVTotalPages"
          :on-load-more="loadMoreFilteredTVShows"
        />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useMovieStore } from "./stores/movieStore";
import { useTVStore } from "./stores/tvStore";
import Navbar from "./components/Navbar.vue";
import MovieList from "./components/MovieList.vue";
import TVList from "./components/TVList.vue";
import Footer from "./components/Footer.vue";

const route = useRoute();
const movieStore = useMovieStore();
const tvStore = useTVStore();
const {
  hasActiveFilters,
  filteredResults,
  loading,
  error,
  filteredLoadingMore,
  filteredCurrentPage,
  filteredTotalPages,
  filteredTotalResults,
} = storeToRefs(movieStore);
const {
  hasActiveFilters: tvHasActiveFilters,
  filteredResults: filteredTVResults,
  loading: tvLoading,
  error: tvError,
  filteredLoadingMore: filteredTVLoadingMore,
  filteredCurrentPage: filteredTVCurrentPage,
  filteredTotalPages: filteredTVTotalPages,
  filteredTotalResults: filteredTVTotalResults,
} = storeToRefs(tvStore);
const { clearFilters, loadMoreFilteredMovies } = movieStore;
const { clearFilters: clearTVFilters, loadMoreFilteredTVShows } = tvStore;

// Check if we're on a details page (movie or TV details)
const isDetailsPage = computed(() => {
  const path = route.path;
  // Check if it's a details page (has numeric ID after /movie/ or /tv/)
  return /^\/movie\/\d+$/.test(path) || /^\/tv\/\d+$/.test(path);
});

// List of routes that should show filtered results
const filteredResultsRoutes = ["/", "/now-playing", "/top-rated"];
const filteredTVResultsRoutes = ["/tv", "/tv/on-the-air", "/tv/top-rated"];

// Check if current route should show filtered results
const shouldShowFilteredResults = computed(() => {
  return hasActiveFilters.value && filteredResultsRoutes.includes(route.path) && !isDetailsPage.value;
});

const shouldShowFilteredTVResults = computed(() => {
  return tvHasActiveFilters.value && filteredTVResultsRoutes.includes(route.path) && !isDetailsPage.value;
});

// Clear filters when navigating to a different route
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (!oldPath) return; // Skip on initial mount
    
    // Clear filters when navigating to any different route
    // This ensures users see the actual page content when clicking NavItems
    if (hasActiveFilters.value && newPath !== oldPath) {
      clearFilters();
    }
    if (tvHasActiveFilters.value && newPath !== oldPath) {
      clearTVFilters();
    }
  },
  { immediate: false }
);
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
