<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-32">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">
        Search Movies
        <span v-if="searchTotalResults > 0" class="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
          ({{ searchTotalResults.toLocaleString() }})
        </span>
      </h1>
      <div class="mb-8">
        <input
          v-model="query"
          @input="debouncedSearch"
          type="text"
          placeholder="Search for movies..."
          class="w-full p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <MovieList
        :movies="searchResults"
        :loading="loading"
        :error="error"
        :has-attempted-fetch="hasAttemptedFetch"
        :loading-more="loadingMore"
        :has-more="currentPage < totalPages && searchQuery.length > 0"
        :on-load-more="loadMoreMovies"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";
import MovieList from "../components/MovieList.vue";

const store = useMovieStore();
const { searchResults, loading, loadingMore, error, currentPage, totalPages, searchQuery, hasAttemptedFetch, searchTotalResults } = storeToRefs(store);
const { searchMoviesAction, loadMoreMovies } = store;
const query = ref("");

let timeout: number | null = null;

const debouncedSearch = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (query.value.trim()) {
      searchMoviesAction(query.value, true);
    } else {
      // Clear search results when query is empty
      searchResults.value = [];
      (store as any).currentPage.value = 1;
      (store as any).totalPages.value = 1;
    }
  }, 500);
};

watch(
  () => query.value,
  (newQuery) => {
    if (!newQuery.trim()) {
      searchResults.value = [];
      (store as any).currentPage.value = 1;
      (store as any).totalPages.value = 1;
      (store as any).hasAttemptedFetch.value = false;
    }
  }
);
</script>
