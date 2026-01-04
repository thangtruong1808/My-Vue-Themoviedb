<template>
  <div
    class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <router-link :to="`/movie/${movie.id}`">
      <img
        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
        :alt="movie.title"
        class="w-full h-64 object-cover"
        loading="lazy"
      />
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
