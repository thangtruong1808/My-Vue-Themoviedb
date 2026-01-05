<template>
  <div class="min-h-screen bg-gray-900 text-white pb-32">
    <Navbar />
    
    <!-- Hero Section with Backdrop -->
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
              <h1 class="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                {{ movieDetails.title }}
                <span v-if="movieDetails.release_date" class="text-2xl md:text-3xl font-normal text-gray-300">
                  ({{ new Date(movieDetails.release_date).getFullYear() }})
                </span>
              </h1>
              <div class="flex flex-wrap items-center gap-4 text-sm md:text-base mb-3">
                <div v-if="movieDetails.release_date" class="flex items-center">
                  <span>{{ formatDate(movieDetails.release_date) }}</span>
                </div>
                <span v-if="movieDetails.genres && movieDetails.genres.length > 0" class="text-gray-400">•</span>
                <div v-if="movieDetails.genres && movieDetails.genres.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(genre, index) in movieDetails.genres"
                    :key="genre.id"
                    class="px-2 py-1 bg-white/20 rounded text-xs"
                  >
                    {{ genre.name }}
                  </span>
                </div>
                <span v-if="movieDetails.runtime" class="text-gray-400">•</span>
                <span v-if="movieDetails.runtime">{{ formatRuntime(movieDetails.runtime) }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-black font-bold">
                    {{ Math.round((movieDetails.vote_average || 0) * 10) }}%
                  </div>
                  <span class="text-sm">User Score</span>
                </div>
                <button
                  v-if="trailerVideo"
                  @click="openTrailer"
                  class="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-semibold"
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

    <!-- Back Button -->
    <div class="container mx-auto px-4 pt-6 ">
      <button
        @click="goBack"
        class="back-button flex items-center text-gray-300 hover:text-white transition-colors mb-6 hover:bg-transparent border-2 border-transparent hover:border-blue-500 rounded-lg px-3 py-2"
      >
        <svg class="w-5 h-5 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span>Back</span>
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
            <p class="text-gray-300 leading-relaxed break-words text-justify">{{ movieDetails.overview }}</p>
          </div>

          <!-- Facts Section (Mobile/Tablet - shown above Top Billed Cast) -->
          <div class="mb-8 lg:hidden order-2">
            <!-- Mobile Poster -->
            <div class="md:hidden mb-6">
              <MoviePoster
                :poster-path="movieDetails.poster_path"
                :alt="movieDetails.title"
                size="w500"
                object-fit="contain"
                container-class="w-full rounded-lg"
                image-class="rounded-lg"
              />
            </div>

            <!-- Facts -->
            <div class="grid grid-cols-2 gap-6">
              <div v-if="movieDetails.status">
                <h3 class="font-semibold mb-2">Status</h3>
                <p class="text-gray-300">{{ movieDetails.status }}</p>
              </div>

              <div v-if="movieDetails.original_language">
                <h3 class="font-semibold mb-2">Original Language</h3>
                <p class="text-gray-300">{{ movieDetails.original_language.toUpperCase() }}</p>
              </div>

              <div v-if="movieDetails.budget">
                <h3 class="font-semibold mb-2">Budget</h3>
                <p class="text-gray-300">${{ formatCurrency(movieDetails.budget) }}</p>
              </div>

              <div v-if="movieDetails.revenue">
                <h3 class="font-semibold mb-2">Revenue</h3>
                <p class="text-gray-300">${{ formatCurrency(movieDetails.revenue) }}</p>
              </div>

              <div v-if="movieDetails.keywords?.keywords && movieDetails.keywords.keywords.length > 0" class="col-span-2">
                <h3 class="font-semibold mb-2">Keywords</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="keyword in movieDetails.keywords.keywords"
                    :key="keyword.id"
                    class="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    {{ keyword.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Genres -->
            <div v-if="movieDetails.genres && movieDetails.genres.length > 0" class="mt-6">
              <h3 class="font-semibold mb-2">Genres</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in movieDetails.genres"
                  :key="genre.id"
                  class="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300"
                >
                  {{ genre.name }}
                </span>
              </div>
            </div>

            <!-- Production Companies -->
            <div v-if="movieDetails.production_companies && movieDetails.production_companies.length > 0" class="mt-6">
              <h3 class="font-semibold mb-2">Production Companies</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="company in movieDetails.production_companies"
                  :key="company.id"
                  class="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300"
                >
                  {{ company.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Top Billed Cast -->
          <div v-if="cast.length > 0" class="mb-8 order-3">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold">Top Billed Cast</h2>
            </div>
            <div class="relative">
              <div 
                ref="castCarouselContainer"
                class="w-full overflow-hidden pb-4 carousel-container"
              >
                <div 
                  ref="castCarousel"
                  class="flex gap-4 transition-transform duration-300 ease-in-out"
                  :style="{ transform: `translateX(-${castScrollPosition}px)` }"
                >
                  <div
                    v-for="actor in (showAllCast ? cast : cast.slice(0, 10))"
                    :key="actor.id"
                    class="flex-shrink-0 w-36 cursor-pointer group"
                    @click="goToPerson(actor.id)"
                  >
                    <div class="mb-2">
                      <img
                        v-if="actor.profile_path"
                        :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
                        :alt="actor.name"
                        class="w-full aspect-[2/3] object-cover rounded-lg border-2 border-gray-700 group-hover:border-blue-500 transition-colors"
                        @error="handleImageError"
                      />
                      <div
                        v-else
                        class="w-full aspect-[2/3] bg-gray-700 rounded-lg flex items-center justify-center"
                      >
                        <svg class="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div class="font-semibold text-sm">{{ actor.name }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ actor.character }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Navigation Buttons -->
              <button
                v-if="canScrollCastLeft"
                @click="scrollCastLeft"
                class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Previous cast"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                v-if="canScrollCastRight"
                @click="scrollCastRight"
                class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Next cast"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div v-if="cast.length > 10" class="mt-4">
              <button 
                @click="toggleCastDisplay"
                class="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {{ showAllCast ? 'Show Less' : `View More (${cast.length - 10} more)` }}
              </button>
            </div>
          </div>

          <!-- Media Section -->
          <div class="mb-8 order-4">
            <div class="flex items-center gap-4 mb-4 border-b border-gray-700">
              <h2 class="text-2xl font-bold pb-4">Media</h2>
              <div class="flex gap-1 pb-4 -mb-px">
                <button
                  v-for="tab in mediaTabs"
                  :key="tab.id"
                  @click="activeMediaTab = tab.id"
                  :class="[
                    'px-4 py-2 text-sm font-semibold transition-colors',
                    activeMediaTab === tab.id
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-300'
                  ]"
                >
                  {{ tab.label }}
                  <span v-if="tab.count" class="ml-1 text-gray-500">({{ tab.count }})</span>
                </button>
              </div>
            </div>

            <!-- Videos Tab -->
            <div v-if="activeMediaTab === 'videos' && videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="video in videos.slice(0, 6)"
                :key="video.id"
                class="cursor-pointer group"
                @click="openVideo(video.key)"
              >
                <div class="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-2">
                  <img
                    :src="`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`"
                    :alt="video.name"
                    class="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    @error="handleImageError"
                  />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                      <svg class="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="text-sm font-semibold">{{ video.name }}</div>
                <div class="text-xs text-gray-400">{{ video.type }}</div>
              </div>
            </div>
            <div v-else-if="activeMediaTab === 'videos'" class="text-gray-400 py-8 text-center">
              No videos available
            </div>

            <!-- Backdrops Tab -->
            <div v-if="activeMediaTab === 'backdrops' && backdrops.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="backdrop in backdrops.slice(0, 12)"
                :key="backdrop.file_path"
                class="cursor-pointer group"
                @click="openImageModal(`https://image.tmdb.org/t/p/original${backdrop.file_path}`)"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/w780${backdrop.file_path}`"
                  alt="Backdrop"
                  class="w-full aspect-video object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                />
              </div>
            </div>
            <div v-else-if="activeMediaTab === 'backdrops'" class="text-gray-400 py-8 text-center">
              No backdrops available
            </div>

            <!-- Posters Tab -->
            <div v-if="activeMediaTab === 'posters' && posters.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="poster in posters.slice(0, 18)"
                :key="poster.file_path"
                class="cursor-pointer group"
                @click="openImageModal(`https://image.tmdb.org/t/p/original${poster.file_path}`)"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/w500${poster.file_path}`"
                  alt="Poster"
                  class="w-full aspect-[2/3] object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                />
              </div>
            </div>
            <div v-else-if="activeMediaTab === 'posters'" class="text-gray-400 py-8 text-center">
              No posters available
            </div>
          </div>

          <!-- Recommendations Section -->
          <div v-if="recommendations.length > 0" class="mb-8 order-5">
            <h2 class="text-2xl font-bold mb-4">Recommendations</h2>
            <div class="relative">
              <div 
                ref="recommendationsCarouselContainer"
                class="w-full overflow-hidden pb-4 carousel-container"
              >
                <div 
                  ref="recommendationsCarousel"
                  class="flex gap-4 transition-transform duration-300 ease-in-out"
                  :style="{ transform: `translateX(-${recommendationsScrollPosition}px)` }"
                >
                  <div
                    v-for="movie in recommendations.slice(0, 20)"
                    :key="movie.id"
                    class="flex-shrink-0 w-40 cursor-pointer group"
                    @click="goToMovie(movie.id)"
                  >
                    <div class="mb-2">
                      <img
                        v-if="movie.poster_path"
                        :src="`https://image.tmdb.org/t/p/w185${movie.poster_path}`"
                        :alt="movie.title"
                        class="w-full aspect-[2/3] object-cover rounded-lg border-2 border-gray-700 group-hover:border-blue-500 transition-colors"
                        @error="handleImageError"
                      />
                      <div
                        v-else
                        class="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center"
                      >
                        <svg class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div class="font-semibold text-sm mb-1 line-clamp-2">{{ movie.title }}</div>
                    <div class="text-xs text-gray-400">{{ movie.release_date ? new Date(movie.release_date).getFullYear() : '—' }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Navigation Buttons -->
              <button
                v-if="canScrollRecommendationsLeft"
                @click="scrollRecommendationsLeft"
                class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Previous recommendations"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                v-if="canScrollRecommendationsRight"
                @click="scrollRecommendationsRight"
                class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Next recommendations"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar (Desktop only) -->
        <div class="w-full lg:w-80 flex-shrink-0 hidden lg:block">
          <!-- Facts -->
          <div class="space-y-6">
            <div v-if="movieDetails.status">
              <h3 class="font-semibold mb-2">Status</h3>
              <p class="text-gray-300">{{ movieDetails.status }}</p>
            </div>

            <div v-if="movieDetails.original_language">
              <h3 class="font-semibold mb-2">Original Language</h3>
              <p class="text-gray-300">{{ movieDetails.original_language.toUpperCase() }}</p>
            </div>

            <div v-if="movieDetails.budget">
              <h3 class="font-semibold mb-2">Budget</h3>
              <p class="text-gray-300">${{ formatCurrency(movieDetails.budget) }}</p>
            </div>

            <div v-if="movieDetails.revenue">
              <h3 class="font-semibold mb-2">Revenue</h3>
              <p class="text-gray-300">${{ formatCurrency(movieDetails.revenue) }}</p>
            </div>

            <div v-if="movieDetails.keywords?.keywords && movieDetails.keywords.keywords.length > 0">
              <h3 class="font-semibold mb-2">Keywords</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="keyword in movieDetails.keywords.keywords"
                  :key="keyword.id"
                  class="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  {{ keyword.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Genres -->
          <div v-if="movieDetails.genres && movieDetails.genres.length > 0" class="mt-6">
            <h3 class="font-semibold mb-2">Genres</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="genre in movieDetails.genres"
                :key="genre.id"
                class="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300"
              >
                {{ genre.name }}
              </span>
            </div>
          </div>

          <!-- Production Companies -->
          <div v-if="movieDetails.production_companies && movieDetails.production_companies.length > 0" class="mt-6">
            <h3 class="font-semibold mb-2">Production Companies</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="company in movieDetails.production_companies"
                :key="company.id"
                class="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300"
              >
                {{ company.name }}
              </span>
            </div>
          </div>
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
    <div
      v-if="showVideoModal"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      @click.self="showVideoModal = false"
    >
      <button
        @click="showVideoModal = false"
        class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="w-full max-w-4xl aspect-video">
        <iframe
          :src="`https://www.youtube.com/embed/${currentVideoKey}?autoplay=1`"
          class="w-full h-full rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      @click.self="showImageModal = false"
    >
      <button
        @click="showImageModal = false"
        class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        :src="currentImageUrl"
        alt="Full size"
        class="max-w-full max-h-[90vh] object-contain"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";
import Navbar from "../components/Navbar.vue";
import MoviePoster from "../components/MoviePoster.vue";

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

// Cast carousel state
const castCarousel = ref<HTMLElement | null>(null);
const castCarouselContainer = ref<HTMLElement | null>(null);
const castScrollPosition = ref(0);

// Recommendations carousel state
const recommendationsCarousel = ref<HTMLElement | null>(null);
const recommendationsCarouselContainer = ref<HTMLElement | null>(null);
const recommendationsScrollPosition = ref(0);

// Cast display state
const showAllCast = ref(false);

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

// Cast carousel navigation
const canScrollCastLeft = computed(() => castScrollPosition.value > 0);
const canScrollCastRight = computed(() => {
  if (!castCarousel.value || !castCarouselContainer.value) return false;
  const maxScroll = castCarousel.value.scrollWidth - castCarouselContainer.value.clientWidth;
  return castScrollPosition.value < maxScroll;
});

const scrollCastLeft = () => {
  if (!castCarouselContainer.value) return;
  const scrollAmount = castCarouselContainer.value.clientWidth;
  castScrollPosition.value = Math.max(0, castScrollPosition.value - scrollAmount);
};

const scrollCastRight = () => {
  if (!castCarousel.value || !castCarouselContainer.value) return;
  const scrollAmount = castCarouselContainer.value.clientWidth;
  const maxScroll = castCarousel.value.scrollWidth - castCarouselContainer.value.clientWidth;
  castScrollPosition.value = Math.min(maxScroll, castScrollPosition.value + scrollAmount);
};

// Toggle cast display and reset scroll position
const toggleCastDisplay = () => {
  showAllCast.value = !showAllCast.value;
  castScrollPosition.value = 0; // Reset scroll position when toggling
};

// Recommendations carousel navigation
const canScrollRecommendationsLeft = computed(() => recommendationsScrollPosition.value > 0);
const canScrollRecommendationsRight = computed(() => {
  if (!recommendationsCarousel.value || !recommendationsCarouselContainer.value) return false;
  const maxScroll = recommendationsCarousel.value.scrollWidth - recommendationsCarouselContainer.value.clientWidth;
  return recommendationsScrollPosition.value < maxScroll;
});

const scrollRecommendationsLeft = () => {
  if (!recommendationsCarouselContainer.value) return;
  const scrollAmount = recommendationsCarouselContainer.value.clientWidth;
  recommendationsScrollPosition.value = Math.max(0, recommendationsScrollPosition.value - scrollAmount);
};

const scrollRecommendationsRight = () => {
  if (!recommendationsCarousel.value || !recommendationsCarouselContainer.value) return;
  const scrollAmount = recommendationsCarouselContainer.value.clientWidth;
  const maxScroll = recommendationsCarousel.value.scrollWidth - recommendationsCarouselContainer.value.clientWidth;
  recommendationsScrollPosition.value = Math.min(maxScroll, recommendationsScrollPosition.value + scrollAmount);
};

// Get videos
const videos = computed(() => {
  return movieVideos.value || [];
});

// Get trailer video
const trailerVideo = computed(() => {
  return videos.value.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
         videos.value.find(v => v.type === 'Teaser' && v.site === 'YouTube') ||
         videos.value[0];
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

// Media tabs
const mediaTabs = computed(() => [
  { id: 'videos' as const, label: 'Videos', count: videos.value.length },
  { id: 'backdrops' as const, label: 'Backdrops', count: backdrops.value.length },
  { id: 'posters' as const, label: 'Posters', count: posters.value.length },
]);

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

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US').format(amount);
};

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
};

// Open video
const openVideo = (key: string) => {
  currentVideoKey.value = key;
  showVideoModal.value = true;
};

// Open trailer
const openTrailer = () => {
  if (trailerVideo.value) {
    openVideo(trailerVideo.value.key);
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
      castScrollPosition.value = 0; // Reset carousel position
      recommendationsScrollPosition.value = 0; // Reset recommendations carousel position
      showAllCast.value = false; // Reset cast display
    }
  }
);

// Reset carousel position when cast changes
watch(cast, () => {
  castScrollPosition.value = 0;
});

// Reset scroll position when showAllCast changes
watch(showAllCast, () => {
  castScrollPosition.value = 0;
});

// Reset recommendations carousel position when recommendations change
watch(recommendations, () => {
  recommendationsScrollPosition.value = 0;
});
</script>

<style scoped>
.back-button {
  background-color: transparent !important;
  font-weight: normal !important;
}

.back-button:hover {
  border-color: #3b82f6 !important; /* blue-500 */
}

/* Custom scrollbar for carousel */
.carousel-container {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.carousel-container::-webkit-scrollbar {
  height: 8px;
}

.carousel-container::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

.carousel-container::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.carousel-container::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}


/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
