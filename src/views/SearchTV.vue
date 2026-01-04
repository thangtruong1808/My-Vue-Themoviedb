<template>
  <div class="min-h-screen bg-gray-900 text-white pb-32">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Search TV Shows</h1>
      <div class="mb-8">
        <input
          v-model="query"
          @input="debouncedSearch"
          type="text"
          placeholder="Search for TV shows..."
          class="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <TVList
        :tv-shows="searchResults"
        :loading="loading"
        :error="error"
        :loading-more="loadingMore"
        :has-more="searchCurrentPage < searchTotalPages"
        :on-load-more="loadMoreSearchTVShows"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useTVStore } from "../stores/tvStore";
import Navbar from "../components/Navbar.vue";
import TVList from "../components/TVList.vue";

const store = useTVStore();
const { searchResults, loading, loadingMore, error, searchCurrentPage, searchTotalPages } = storeToRefs(store);
const { searchTVShowsAction, loadMoreSearchTVShows } = store;
const query = ref("");

let timeout: number | null = null;

const debouncedSearch = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (query.value.trim()) {
      searchTVShowsAction(query.value);
    }
  }, 500);
};

watch(
  () => query.value,
  (newQuery) => {
    if (!newQuery.trim()) {
      (store as any).searchResults.value = [];
    }
  }
);
</script>

