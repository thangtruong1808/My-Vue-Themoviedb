<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 hover:bg-gray-50 dark:hover:bg-gray-700"
  >
    <router-link :to="`/movie/${movie.id}`">
      <div class="w-full rounded-t-lg overflow-hidden">
        <ImageResizer
          :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''"
          :alt="movie.title"
          width="100%"
          :height="256"
          fit-mode="contain"
          background-color="#f3f4f6"
        />
      </div>
    </router-link>
    <div class="p-2">
      <h3 class="text-lg font-semibold mb-1 truncate text-gray-900 dark:text-white">{{ movie.title }}</h3>
      <div class="flex items-center justify-between mb-1">
        <p class="text-gray-600 dark:text-gray-400 text-sm">{{ movie.release_date }}</p>
        <div class="flex items-center">
          <span class="text-yellow-400 mr-1">★</span>
          <span class="text-sm">{{ movie.vote_average.toFixed(1) }}</span>
        </div>
      </div>
      <div v-if="movie.video" class="flex items-center text-blue-400">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        <span class="ml-1 text-xs">Video</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImageResizer from "./ImageResizer.vue";

defineProps<{
  movie: {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    video?: boolean;
  };
}>();
</script>
