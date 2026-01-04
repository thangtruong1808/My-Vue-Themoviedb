<template>
  <!-- Priority 1: Show movies if we have them (regardless of loading state) -->
  <div
    v-if="movies && Array.isArray(movies) && movies.length > 0"
    class="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
  >
    <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
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
    <div class="text-xl text-gray-400">No movies found</div>
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
import MovieCard from "./MovieCard.vue";

const props = withDefaults(defineProps<{
  movies: any[];
  loading: boolean;
  error: string;
  hasAttemptedFetch?: boolean;
}>(), {
  hasAttemptedFetch: false,
});
</script>
