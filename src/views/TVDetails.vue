<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <Navbar />
    <div class="container mx-auto px-4 py-8" v-if="tvShowDetails">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
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
          :poster-path="tvShowDetails.poster_path"
          :alt="tvShowDetails.name"
          size="w500"
          object-fit="contain"
          container-class="w-full md:w-1/3 rounded-lg"
          image-class="rounded-lg"
        />
        <div class="flex-1">
          <h1 class="text-4xl font-bold mb-4">{{ tvShowDetails.name }}</h1>
          <p class="text-lg mb-4">{{ tvShowDetails.overview }}</p>
          <p class="mb-2">
            <strong>First Air Date:</strong> {{ tvShowDetails.first_air_date }}
          </p>
          <p class="mb-2">
            <strong>Rating:</strong> {{ tvShowDetails.vote_average }}/10
          </p>
          <p class="mb-2" v-if="tvShowDetails.number_of_seasons">
            <strong>Seasons:</strong> {{ tvShowDetails.number_of_seasons }}
          </p>
          <p class="mb-2" v-if="tvShowDetails.number_of_episodes">
            <strong>Episodes:</strong> {{ tvShowDetails.number_of_episodes }}
          </p>
          <p class="mb-4">
            <strong>Genres:</strong>
            {{ tvShowDetails.genres.map((g: any) => g.name).join(", ") }}
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
import { useRoute, useRouter } from "vue-router";
import { useTVStore } from "../stores/tvStore";
import Navbar from "../components/Navbar.vue";
import MoviePoster from "../components/MoviePoster.vue";

const route = useRoute();
const router = useRouter();
const store = useTVStore();
const { tvShowDetails, loading, error, fetchTVShowDetails } = store;

const goBack = () => {
  router.back();
};

onMounted(() => {
  const id = route.params.id as string;
  fetchTVShowDetails(id);
});
</script>

