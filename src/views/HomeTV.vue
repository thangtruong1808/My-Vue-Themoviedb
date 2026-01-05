<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-32">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">
        Popular TV Shows
        <span v-if="totalResults > 0" class="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
          ({{ totalResults.toLocaleString() }})
        </span>
      </h1>
      <TVList
        :tv-shows="tvShows"
        :loading="loading"
        :error="error"
        :has-attempted-fetch="hasAttemptedFetch"
        :loading-more="loadingMore"
        :has-more="currentPage < totalPages"
        :on-load-more="loadMoreTVShows"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTVStore } from "../stores/tvStore";
import Navbar from "../components/Navbar.vue";
import TVList from "../components/TVList.vue";

const store = useTVStore();
// Use storeToRefs to maintain reactivity for state properties
const { tvShows, loading, loadingMore, error, hasAttemptedFetch, currentPage, totalPages, totalResults } = storeToRefs(store);
// Methods don't need storeToRefs, access directly from store
const { fetchPopularTVShows, loadMoreTVShows } = store;

// Set loading to true and clear tvShows BEFORE first render to show skeleton
// This prevents "No TV shows found" or wrong TV shows from showing before fetch starts
onBeforeMount(() => {
  // Always clear tvShows when entering this page to avoid showing wrong data
  tvShows.value = [];
  if (!loading.value) {
    loading.value = true;
  }
  error.value = "";
});

onMounted(() => {
  fetchPopularTVShows();
});
</script>

