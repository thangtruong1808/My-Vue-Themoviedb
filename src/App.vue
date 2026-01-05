<template>
  <div id="app">
    <router-view v-if="!shouldShowFilteredResults || isDetailsPage" />
    <div v-else-if="shouldShowFilteredResults" class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-32">
      <Navbar />
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">
            Filtered {{ selectedType === 'tv' ? 'TV Shows' : 'Movies' }}
            <span v-if="filteredTotalResults > 0" class="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
              ({{ filteredTotalResults.toLocaleString() }})
            </span>
          </h1>
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        <MovieList
          v-if="selectedType === 'movie'"
          :movies="filteredResults as any[]"
          :loading="loading"
          :error="error"
          :has-attempted-fetch="true"
          :loading-more="filteredLoadingMore"
          :has-more="filteredCurrentPage < filteredTotalPages"
          :on-load-more="loadMoreFilteredResults"
        />
        <TVList
          v-else
          :tv-shows="filteredResults as any[]"
          :loading="loading"
          :error="error"
          :has-attempted-fetch="true"
          :loading-more="filteredLoadingMore"
          :has-more="filteredCurrentPage < filteredTotalPages"
          :on-load-more="loadMoreFilteredResults"
        />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useSearchStore } from "./stores/searchStore";
import Navbar from "./components/Navbar.vue";
import MovieList from "./components/MovieList.vue";
import TVList from "./components/TVList.vue";
import Footer from "./components/Footer.vue";

const route = useRoute();
const searchStore = useSearchStore();
const {
  hasActiveFilters,
  filteredResults,
  loading,
  error,
  filteredLoadingMore,
  filteredCurrentPage,
  filteredTotalPages,
  filteredTotalResults,
  selectedType,
} = storeToRefs(searchStore);
const { clearFilters, loadMoreFilteredResults, initializeFromURL } = searchStore;

// Check if we're on a details page (movie, TV, or person details)
const isDetailsPage = computed(() => {
  const path = route.path;
  return /^\/movie\/\d+$/.test(path) || /^\/tv\/\d+$/.test(path) || /^\/person\/\d+$/.test(path);
});

// Show filtered results when filters are active, regardless of route
const shouldShowFilteredResults = computed(() => {
  return hasActiveFilters.value && !isDetailsPage.value;
});

// Initialize URL on mount (theme is initialized in main.ts before app mounts)
onMounted(() => {
  initializeFromURL();
});

// Watch for route changes - don't clear filters automatically anymore
// Filters will persist across navigation and URL will update accordingly
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
