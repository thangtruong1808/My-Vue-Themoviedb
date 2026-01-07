<template>
  <div v-if="recommendations.length > 0" class="mb-8 order-5">
    <h2 class="text-2xl font-bold mb-4">Recommendations</h2>
    <div class="relative">
      <div 
        ref="carouselContainer"
        class="w-full overflow-hidden pb-4 carousel-container"
      >
        <div 
          ref="carousel"
          class="flex gap-4 transition-transform duration-300 ease-in-out"
          :style="{ transform: `translateX(-${scrollPosition}px)` }"
        >
          <div
            v-for="movie in recommendations.slice(0, 20)"
            :key="movie.id"
            class="flex-shrink-0 w-40 cursor-pointer group"
            @click="$emit('movie-click', movie.id)"
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
                class="w-full aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
              >
                <svg class="w-12 h-12 text-gray-500 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="font-semibold text-sm mb-1 line-clamp-2">{{ movie.title }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">{{ movie.release_date ? new Date(movie.release_date).getFullYear() : '—' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Buttons -->
      <button
        v-if="canScrollLeft"
        @click="scrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200/90 dark:bg-gray-800/90 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Previous recommendations"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        v-if="canScrollRight"
        @click="scrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200/90 dark:bg-gray-800/90 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Next recommendations"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface Recommendation {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
}

interface Props {
  recommendations: Recommendation[];
}

const props = defineProps<Props>();

defineEmits<{
  'movie-click': [movieId: number];
}>();

const carousel = ref<HTMLElement | null>(null);
const carouselContainer = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);

const canScrollLeft = computed(() => scrollPosition.value > 0);
const canScrollRight = computed(() => {
  if (!carousel.value || !carouselContainer.value) return false;
  const maxScroll = carousel.value.scrollWidth - carouselContainer.value.clientWidth;
  return scrollPosition.value < maxScroll;
});

const scrollLeft = () => {
  if (!carouselContainer.value) return;
  const scrollAmount = carouselContainer.value.clientWidth;
  scrollPosition.value = Math.max(0, scrollPosition.value - scrollAmount);
};

const scrollRight = () => {
  if (!carousel.value || !carouselContainer.value) return;
  const scrollAmount = carouselContainer.value.clientWidth;
  const maxScroll = carousel.value.scrollWidth - carouselContainer.value.clientWidth;
  scrollPosition.value = Math.min(maxScroll, scrollPosition.value + scrollAmount);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
};

// Reset scroll position when recommendations change
watch(() => props.recommendations, () => {
  scrollPosition.value = 0;
});
</script>

<style scoped>
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

