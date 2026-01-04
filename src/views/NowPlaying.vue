<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Now Playing Movies</h1>
      <MovieList :movies="movies" :loading="loading" :error="error" :has-attempted-fetch="hasAttemptedFetch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";
import MovieList from "../components/MovieList.vue";

const store = useMovieStore();
// Use storeToRefs to maintain reactivity for state properties
const { movies, loading, error, hasAttemptedFetch } = storeToRefs(store);
// Methods don't need storeToRefs, access directly from store
const { fetchNowPlayingMovies } = store;

// Set loading to true and clear movies BEFORE first render to show skeleton
// This prevents "No movies found" or wrong movies from showing before fetch starts
onBeforeMount(() => {
  // Always clear movies when entering this page to avoid showing wrong data
  movies.value = [];
  if (!loading.value) {
    loading.value = true;
  }
  error.value = "";
});

onMounted(() => {
  fetchNowPlayingMovies();
});
</script>
