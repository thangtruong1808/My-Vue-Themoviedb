<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Now Playing Movies</h1>
      <MovieList :movies="movies" :loading="loading" :error="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";
import MovieList from "../components/MovieList.vue";

const store = useMovieStore();
const { movies, loading, error, fetchNowPlayingMovies } = store;

onMounted(() => {
  fetchNowPlayingMovies();
});
</script>
