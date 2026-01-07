<template>
  <div v-if="cast.length > 0" class="mb-8 order-3">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Top Billed Cast</h2>
    </div>
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
            v-for="actor in (showAll ? cast : cast.slice(0, 10))"
            :key="actor.id"
            class="flex-shrink-0 w-36 cursor-pointer group"
            @click="$emit('person-click', actor.id)"
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
                class="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
              >
                <svg class="w-16 h-16 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="font-semibold text-sm">{{ actor.name }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ actor.character }}</div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Buttons -->
      <button
        v-if="canScrollLeft"
        @click="scrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200/90 dark:bg-gray-800/90 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Previous cast"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        v-if="canScrollRight"
        @click="scrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200/90 dark:bg-gray-800/90 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Next cast"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <div v-if="cast.length > 10" class="mt-4">
      <button 
        @click="toggleDisplay"
        class="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
      >
        {{ showAll ? 'Show Less' : `View More (${cast.length - 10} more)` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

interface Props {
  cast: CastMember[];
}

const props = defineProps<Props>();

defineEmits<{
  'person-click': [personId: number];
}>();

const carousel = ref<HTMLElement | null>(null);
const carouselContainer = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);
const showAll = ref(false);

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

const toggleDisplay = () => {
  showAll.value = !showAll.value;
  scrollPosition.value = 0;
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
};

// Reset scroll position when cast changes
watch(() => props.cast, () => {
  scrollPosition.value = 0;
});

// Reset scroll position when showAll changes
watch(showAll, () => {
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
</style>

