<template>
  <div
    class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <router-link :to="`/movie/${movie.id}`">
      <div class="w-full rounded-t-lg overflow-hidden">
        <ImageResizer
          :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''"
          :alt="movie.title"
          width="100%"
          :height="256"
          fit-mode="contain"
          background-color="#1f2937"
        />
      </div>
    </router-link>
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2 truncate">{{ movie.title }}</h3>
      <p class="text-gray-400 text-sm mb-2">{{ movie.release_date }}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-yellow-400 mr-1">★</span>
          <span>{{ movie.vote_average.toFixed(1) }}</span>
        </div>
        <div v-if="movie.video" class="flex items-center text-blue-400">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          <span class="ml-1 text-xs">Video</span>
        </div>
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
