<template>
  <div
    class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <router-link :to="`/tv/${tvShow.id}`">
      <div class="w-full rounded-t-lg overflow-hidden">
        <ImageResizer
          :src="tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : ''"
          :alt="tvShow.name"
          width="100%"
          :height="256"
          fit-mode="contain"
          background-color="#1f2937"
        />
      </div>
    </router-link>
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2 truncate">{{ tvShow.name }}</h3>
      <p class="text-gray-400 text-sm mb-2">{{ tvShow.first_air_date }}</p>
      <div class="flex items-center">
        <span class="text-yellow-400 mr-1">★</span>
        <span>{{ tvShow.vote_average.toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImageResizer from "./ImageResizer.vue";

defineProps<{
  tvShow: {
    id: number;
    name: string;
    poster_path: string;
    first_air_date: string;
    vote_average: number;
  };
}>();
</script>

