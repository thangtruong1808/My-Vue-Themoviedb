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
      <div class="flex items-center">
        <span class="text-yellow-400 mr-1">★</span>
        <span>{{ movie.vote_average.toFixed(1) }}</span>
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
  };
}>();
</script>
