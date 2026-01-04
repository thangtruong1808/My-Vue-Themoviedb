<template>
  <div id="app">
    <router-view v-if="!shouldShowFilteredResults || isDetailsPage" />
    <div v-else-if="shouldShowFilteredResults" class="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">Filtered Movies</h1>
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
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useMovieStore } from "./stores/movieStore";
import Navbar from "./components/Navbar.vue";
import MovieList from "./components/MovieList.vue";

const route = useRoute();
const store = useMovieStore();
const {
  hasActiveFilters,
  filteredResults,
  loading,
  error,
  filteredLoadingMore,
  filteredCurrentPage,
  filteredTotalPages,
} = storeToRefs(store);
const { clearFilters, loadMoreFilteredMovies } = store;

// Check if we're on a details page (movie or TV details)
const isDetailsPage = computed(() => {
  const path = route.path;
  // Check if it's a details page (has numeric ID after /movie/ or /tv/)
  return /^\/movie\/\d+$/.test(path) || /^\/tv\/\d+$/.test(path);
});

// List of routes that should show filtered results
const filteredResultsRoutes = ["/", "/now-playing", "/top-rated"];

// Check if current route should show filtered results
const shouldShowFilteredResults = computed(() => {
  return hasActiveFilters.value && filteredResultsRoutes.includes(route.path) && !isDetailsPage.value;
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
