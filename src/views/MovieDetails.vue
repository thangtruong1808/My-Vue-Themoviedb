<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <Navbar />
    <div class="container mx-auto px-4 py-8" v-if="movieDetails">
      <div class="flex flex-col md:flex-row gap-8">
        <img
          :src="`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`"
          :alt="movieDetails.title"
          class="w-full md:w-1/3 rounded-lg"
        />
        <div class="flex-1">
          <h1 class="text-4xl font-bold mb-4">{{ movieDetails.title }}</h1>
          <p class="text-lg mb-4">{{ movieDetails.overview }}</p>
          <p class="mb-2">
            <strong>Release Date:</strong> {{ movieDetails.release_date }}
          </p>
          <p class="mb-2">
            <strong>Rating:</strong> {{ movieDetails.vote_average }}/10
          </p>
          <p class="mb-4">
            <strong>Genres:</strong>
            {{ movieDetails.genres.map((g: any) => g.name).join(", ") }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-else-if="loading"
      class="flex justify-center items-center min-h-screen"
    >
      <div class="text-xl">Loading...</div>
    </div>
    <div v-else class="flex justify-center items-center min-h-screen">
      <div class="text-xl text-red-500">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";

const route = useRoute();
const store = useMovieStore();
const { movieDetails, loading, error, fetchMovieDetails } = store;

onMounted(() => {
  const id = route.params.id as string;
  fetchMovieDetails(id);
});
</script>
