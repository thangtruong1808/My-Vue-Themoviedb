<template>
  <div class="min-h-screen bg-gray-900 text-white pb-32">
    <Navbar />
    <div class="container mx-auto px-4 py-8" v-if="movieDetails">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="back-button mb-6 flex items-center text-gray-300 hover:text-white transition-colors "
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
        <span>Back</span>
      </button>
      <div class="flex flex-col md:flex-row gap-8">
        <MoviePoster
          :poster-path="movieDetails.poster_path"
          :alt="movieDetails.title"
          size="w500"
          object-fit="contain"
          container-class="w-full md:w-1/3 rounded-lg"
          image-class="rounded-lg"
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
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";
import MoviePoster from "../components/MoviePoster.vue";

const route = useRoute();
const router = useRouter();
const store = useMovieStore();
// Use storeToRefs to maintain reactivity for state properties
const { movieDetails, loading, error } = storeToRefs(store);
// Methods don't need storeToRefs, access directly from store
const { fetchMovieDetails } = store;

const goBack = () => {
  router.back();
};

const loadMovieDetails = () => {
  const id = route.params.id as string;
  if (id) {
    fetchMovieDetails(id);
  }
};

onMounted(() => {
  loadMovieDetails();
});

// Watch for route parameter changes to refetch when navigating between movies
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadMovieDetails();
    }
  }
);
</script>

<style scoped>
.back-button {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  font-weight: normal !important;
  border-radius: 0 !important;
}
</style>
