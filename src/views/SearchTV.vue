<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-32">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">
        Search TV Shows
        <span v-if="filteredTotalResults > 0" class="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
          ({{ filteredTotalResults.toLocaleString() }})
        </span>
      </h1>
      <TVList
        :tv-shows="displayedTVShows"
        :loading="loading"
        :error="error"
        :has-attempted-fetch="hasAttemptedFetch"
        :loading-more="filteredLoadingMore"
        :has-more="hasMore"
        :on-load-more="handleLoadMore"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useTVStore } from "../stores/tvStore";
import Navbar from "../components/Navbar.vue";
import TVList from "../components/TVList.vue";

const store = useTVStore();
const { filteredResults, loading, error, hasAttemptedFetch, filteredCurrentPage, filteredTotalPages, filteredLoadingMore, hasActiveFilters, filteredTotalResults } = storeToRefs(store);
const { loadMoreFilteredTVShows } = store;

// Display filtered results if filters are active, otherwise show empty state
const displayedTVShows = computed(() => {
  return hasActiveFilters.value ? filteredResults.value : [];
});

const hasMore = computed(() => {
  return hasActiveFilters.value && filteredCurrentPage.value < filteredTotalPages.value;
});

const handleLoadMore = () => {
  if (hasActiveFilters.value) {
    loadMoreFilteredTVShows();
  }
};

// Set hasAttemptedFetch to true so we don't show skeleton on initial load
onBeforeMount(() => {
  if (!hasAttemptedFetch.value) {
    hasAttemptedFetch.value = true;
  }
});
</script>
