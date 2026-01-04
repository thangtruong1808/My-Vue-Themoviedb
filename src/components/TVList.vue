<template>
  <!-- Priority 1: Show TV shows if we have them (regardless of loading state) -->
  <div v-if="tvShows && Array.isArray(tvShows) && tvShows.length > 0">
    <div
      class="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
    >
      <TVCard v-for="tvShow in tvShows" :key="tvShow.id" :tvShow="tvShow" />
    </div>
    <!-- Infinite scroll trigger -->
    <div
      ref="loadMoreTrigger"
      class="w-full h-20 flex items-center justify-center mt-8"
      v-show="hasMore && !loadingMore"
    >
      <div class="text-gray-400 text-sm">Scroll for more TV shows</div>
    </div>
    <!-- Loading more indicator -->
    <div
      v-if="loadingMore"
      class="w-full flex items-center justify-center mt-8"
    >
      <div class="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        <div
          v-for="n in 5"
          :key="n"
          class="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
        >
          <div class="w-full h-64 bg-gray-700"></div>
          <div class="p-4">
            <div class="h-4 bg-gray-700 rounded mb-2"></div>
            <div class="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
            <div class="flex items-center">
              <div class="h-4 bg-gray-700 rounded w-8 mr-2"></div>
              <div class="h-3 bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Priority 2: Show skeleton when loading -->
  <div
    v-else-if="loading"
    class="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
  >
    <div
      v-for="n in 10"
      :key="n"
      class="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
    >
      <div class="w-full h-64 bg-gray-700"></div>
      <div class="p-4">
        <div class="h-4 bg-gray-700 rounded mb-2"></div>
        <div class="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
        <div class="flex items-center">
          <div class="h-4 bg-gray-700 rounded w-8 mr-2"></div>
          <div class="h-3 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  </div>
  <!-- Priority 3: Show error message -->
  <div v-else-if="error" class="text-center py-20">
    <div class="text-xl text-red-500">{{ error }}</div>
  </div>
  <!-- Priority 4: Show empty state only after fetch attempt completed -->
  <div v-else-if="props.hasAttemptedFetch && !loading" class="text-center py-20">
    <div class="text-xl text-gray-400">No TV shows found</div>
  </div>
  <!-- Priority 5: Default to skeleton if we haven't attempted fetch yet -->
  <div
    v-else
    class="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
  >
    <div
      v-for="n in 10"
      :key="n"
      class="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
    >
      <div class="w-full h-64 bg-gray-700"></div>
      <div class="p-4">
        <div class="h-4 bg-gray-700 rounded mb-2"></div>
        <div class="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
        <div class="flex items-center">
          <div class="h-4 bg-gray-700 rounded w-8 mr-2"></div>
          <div class="h-3 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import TVCard from "./TVCard.vue";

const props = withDefaults(defineProps<{
  tvShows: any[];
  loading: boolean;
  error: string;
  hasAttemptedFetch?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}>(), {
  hasAttemptedFetch: false,
  loadingMore: false,
  hasMore: false,
});

const loadMoreTrigger = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;
let loadMoreCallback: (() => void) | null = null;

const setupObserver = () => {
  // Clean up existing observer
  if (observer) {
    if (loadMoreTrigger.value) {
      observer.unobserve(loadMoreTrigger.value);
    }
    observer.disconnect();
    observer = null;
  }

  const callback = props.onLoadMore;
  if (callback && props.hasMore && loadMoreTrigger.value) {
    loadMoreCallback = callback;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !props.loadingMore && props.hasMore && loadMoreCallback) {
            loadMoreCallback();
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreTrigger.value);
  }
};

// Watch for when the trigger element becomes available and props change
watch([() => loadMoreTrigger.value, () => props.hasMore, () => props.onLoadMore], async () => {
  if (props.hasMore && props.onLoadMore) {
    await nextTick();
    setupObserver();
  }
}, { immediate: true });

onMounted(() => {
  nextTick(() => {
    setupObserver();
  });
});

onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
    observer.disconnect();
  }
});
</script>

