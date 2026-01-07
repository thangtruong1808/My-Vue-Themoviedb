<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-32">
    <Navbar />
    
    <!-- Hero Section with Backdrop -->
    <MovieHero
      v-if="movieDetails"
      :movie-details="movieDetails"
      :backdrop-url="backdropUrl"
      :videos="videos"
      @play-trailer="openTrailer"
    />

    <!-- Back Button -->
    <div class="container mx-auto px-4 pt-6 ">
      <button
        @click="goBack"
        class="back-button flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 hover:bg-transparent border-2 border-transparent hover:border-blue-500 rounded-lg px-3 py-2"
      >
        <svg class="w-5 h-5 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span class="text-black dark:text-white">Back</span>
      </button>
    </div>

    <!-- Main Content -->
    <div v-if="movieDetails" class="container mx-auto px-4 w-full">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left Column - Main Content -->
        <div class="flex-1 min-w-0 flex flex-col">
          <!-- Overview -->
          <div v-if="movieDetails.overview" class="mb-8 order-1">
            <h2 class="text-2xl font-bold mb-3">Overview</h2>
            <p class="text-black dark:text-gray-300 leading-relaxed break-words text-justify">{{ movieDetails.overview }}</p>
          </div>

          <!-- Facts Section (Mobile/Tablet - shown above Top Billed Cast) -->
          <MovieFacts
            v-if="movieDetails"
            :movie-details="movieDetails"
            variant="mobile"
            :show-mobile-poster="true"
          />

          <!-- Top Billed Cast -->
          <MovieCast
            :cast="cast"
            @person-click="goToPerson"
          />

          <!-- Media Section -->
          <MovieMedia
            :videos="videos"
            :backdrops="backdrops"
            :posters="posters"
            :active-tab="activeMediaTab"
            @tab-change="activeMediaTab = $event"
            @video-click="openVideo"
            @image-click="openImageModal"
          />

          <!-- Recommendations Section -->
          <MovieRecommendations
            :recommendations="recommendations"
            @movie-click="goToMovie"
          />
        </div>

        <!-- Right Column - Sidebar (Desktop only) -->
        <div class="w-full lg:w-80 flex-shrink-0 hidden lg:block">
          <MovieFacts
            v-if="movieDetails"
            :movie-details="movieDetails"
            variant="desktop"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="text-xl">Loading...</div>
    </div>
    
    <!-- Error State -->
    <div v-else class="flex justify-center items-center min-h-screen">
      <div class="text-xl text-red-500">{{ error }}</div>
    </div>

    <!-- Video Modal -->
    <VideoModal
      :show="showVideoModal"
      :video-key="currentVideoKey"
      @close="showVideoModal = false"
    />

    <!-- Image Modal -->
    <ImageModal
      :show="showImageModal"
      :image-url="currentImageUrl"
      @close="showImageModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";
import MovieHero from "../components/MovieHero.vue";
import MovieFacts from "../components/MovieFacts.vue";
import MovieCast from "../components/MovieCast.vue";
import MovieMedia from "../components/MovieMedia.vue";
import MovieRecommendations from "../components/MovieRecommendations.vue";
import VideoModal from "../components/VideoModal.vue";
import ImageModal from "../components/ImageModal.vue";

const route = useRoute();
const router = useRouter();
const store = useMovieStore();
const { movieDetails, movieCredits, movieImages, movieVideos, movieRecommendations, loading, error } = storeToRefs(store);
const { fetchMovieDetails } = store;

const activeMediaTab = ref<'videos' | 'backdrops' | 'posters'>('videos');
const showVideoModal = ref(false);
const showImageModal = ref(false);
const currentVideoKey = ref('');
const currentImageUrl = ref('');

const goBack = () => {
  router.back();
};

const goToPerson = (personId: number) => {
  router.push(`/person/${personId}`);
};

const goToMovie = (movieId: number) => {
  router.push(`/movie/${movieId}`);
};

const loadMovieDetails = () => {
  const id = route.params.id as string;
  if (id) {
    fetchMovieDetails(id);
  }
};

// Get backdrop image URL
const backdropUrl = computed(() => {
  if (movieImages.value?.backdrops && movieImages.value.backdrops.length > 0) {
    return `https://image.tmdb.org/t/p/original${movieImages.value.backdrops[0].file_path}`;
  }
  if (movieDetails.value?.backdrop_path) {
    return `https://image.tmdb.org/t/p/original${movieDetails.value.backdrop_path}`;
  }
  return null;
});

// Get cast members
const cast = computed(() => {
  return movieCredits.value?.cast || [];
});

// Get videos
const videos = computed(() => {
  return movieVideos.value || [];
});

// Get backdrops
const backdrops = computed(() => {
  return movieImages.value?.backdrops || [];
});

// Get posters
const posters = computed(() => {
  return movieImages.value?.posters || [];
});

// Get recommendations
const recommendations = computed(() => {
  return movieRecommendations.value || [];
});

// Open video
const openVideo = (key: string) => {
  currentVideoKey.value = key;
  showVideoModal.value = true;
};

// Open trailer
const openTrailer = () => {
  const trailerVideo = videos.value.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
                       videos.value.find(v => v.type === 'Teaser' && v.site === 'YouTube') ||
                       videos.value[0];
  if (trailerVideo) {
    openVideo(trailerVideo.key);
  }
};

// Open image modal
const openImageModal = (url: string) => {
  currentImageUrl.value = url;
  showImageModal.value = true;
};

// Set default tab based on available content
watch([videos, backdrops, posters], () => {
  if (videos.value.length > 0) {
    activeMediaTab.value = 'videos';
  } else if (backdrops.value.length > 0) {
    activeMediaTab.value = 'backdrops';
  } else if (posters.value.length > 0) {
    activeMediaTab.value = 'posters';
  }
}, { immediate: true });

onMounted(() => {
  loadMovieDetails();
});

// Watch for route parameter changes to refetch when navigating between movies
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadMovieDetails();
      activeMediaTab.value = 'videos';
      showVideoModal.value = false;
      showImageModal.value = false;
    }
  }
);
</script>

<style scoped>
.back-button {
  background-color: transparent !important;
  font-weight: normal !important;
}

.back-button:hover {
  border-color: #3b82f6 !important; /* blue-500 */
}
</style>
