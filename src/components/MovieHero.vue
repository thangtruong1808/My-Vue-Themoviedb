<template>
  <div 
    v-if="movieDetails && backdropUrl"
    class="relative h-[60vh] min-h-[400px] bg-cover bg-center"
    :style="{ backgroundImage: `url(${backdropUrl})` }"
  >
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black"></div>
    
    <!-- Content Overlay -->
    <div class="relative z-10 container mx-auto px-4 h-full flex items-end pb-12">
      <div class="w-full">
        <div class="flex flex-col md:flex-row gap-6 items-end">
          <!-- Poster -->
          <div class="hidden md:block w-48 flex-shrink-0">
            <MoviePoster
              :poster-path="movieDetails.poster_path"
              :alt="movieDetails.title"
              size="w500"
              object-fit="contain"
              container-class="w-full rounded-lg shadow-2xl"
              image-class="rounded-lg"
            />
          </div>
          
          <!-- Title and Info -->
          <div class="flex-1 pb-4">
            <h1 class="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg text-white">
              {{ movieDetails.title }}
              <span v-if="movieDetails.release_date" class="text-2xl md:text-3xl font-normal text-white dark:text-gray-300">
                ({{ new Date(movieDetails.release_date).getFullYear() }})
              </span>
            </h1>
            <div class="flex flex-wrap items-center gap-4 text-sm md:text-base mb-3 text-white">
              <div v-if="movieDetails.release_date" class="flex items-center ">
                <span>{{ formatDate(movieDetails.release_date) }}</span>
              </div>
              <span v-if="movieDetails.genres && movieDetails.genres.length > 0" class="text-white dark:text-gray-400">•</span>
              <div v-if="movieDetails.genres && movieDetails.genres.length > 0" class="flex flex-wrap gap-2 text-white">
                <span
                  v-for="(genre, index) in movieDetails.genres"
                  :key="genre.id"
                  class="px-2 py-1 bg-white/20 rounded text-xs text-white"
                >
                  {{ genre.name }}
                </span>
              </div>
              <span v-if="movieDetails.runtime" class="text-white">•</span>
              <span v-if="movieDetails.runtime">{{ formatRuntime(movieDetails.runtime) }}</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white font-bold">
                  {{ Math.round((movieDetails.vote_average || 0) * 10) }}%
                </div>
                <span class="text-sm text-white">User Score</span>
              </div>
              <button
                v-if="trailerVideo"
                @click="$emit('play-trailer')"
                class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MoviePoster from "./MoviePoster.vue";

interface Genre {
  id: number;
  name: string;
}

interface MovieDetails {
  title: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: Genre[];
}

interface Video {
  id: string;
  key: string;
  type: string;
  site: string;
}

interface Props {
  movieDetails: MovieDetails | null;
  backdropUrl: string | null;
  videos: Video[];
}

const props = defineProps<Props>();

defineEmits<{
  'play-trailer': [];
}>();

// Get trailer video
const trailerVideo = computed(() => {
  return props.videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
         props.videos.find(v => v.type === 'Teaser' && v.site === 'YouTube') ||
         props.videos[0];
});

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format runtime
const formatRuntime = (minutes: number) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};
</script>

