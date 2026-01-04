<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 backdrop-overlay"
      @click="closeDrawer"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="drawer">
    <div
      v-if="isOpen"
      class="fixed left-0 top-0 h-full w-full md:w-96 bg-gray-800 z-50 shadow-2xl overflow-y-auto"
      @click.stop
    >
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Search & Filter</h2>
          <button
            @click="closeDrawer"
            class="text-gray-400 hover:text-white transition-colors"
            aria-label="Close drawer"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Text Search -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Search Movies
          </label>
          <input
            v-model="localFilters.query"
            type="text"
            placeholder="Enter movie title..."
            class="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedApplyFilters"
          />
        </div>

        <!-- Genres -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Genres
          </label>
          <div
            v-if="genresLoading"
            class="text-gray-400 text-sm"
          >
            Loading genres...
          </div>
          <div
            v-else
            class="space-y-2 max-h-48 overflow-y-auto"
          >
            <label
              v-for="genre in genres"
              :key="genre.id"
              class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                :value="genre.id"
                v-model="localFilters.genres"
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                @change="debouncedApplyFilters"
              />
              <span class="ml-3 text-sm text-gray-300">{{ genre.name }}</span>
            </label>
          </div>
        </div>

        <!-- Year -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Release Year
          </label>
          <input
            v-model.number="localFilters.year"
            type="number"
            min="1900"
            :max="currentYear"
            placeholder="e.g. 2020"
            class="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedApplyFilters"
          />
        </div>

        <!-- Minimum Rating -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Minimum Rating: {{ localFilters.vote_average_gte || 0 }}/10
          </label>
          <input
            v-model.number="localFilters.vote_average_gte"
            type="range"
            min="0"
            max="10"
            step="0.5"
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            @input="debouncedApplyFilters"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <button
          @click="clearFilters"
          class="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";

const store = useMovieStore();
const { searchDrawerOpen, genres, filteredResults, searchFilters } = storeToRefs(store);
const { toggleSearchDrawer, applyFilters, clearFilters: clearStoreFilters, fetchGenres } = store;

const isOpen = computed(() => searchDrawerOpen.value);

// Local filter state - sync with store's searchFilters
const localFilters = ref({
  query: "",
  genres: [] as number[],
  year: undefined as number | undefined,
  vote_average_gte: undefined as number | undefined,
});

const genresLoading = ref(false);
const currentYear = new Date().getFullYear();

let debounceTimeout: number | null = null;

const debouncedApplyFilters = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    applyFilters(localFilters.value);
  }, 500);
};

const closeDrawer = () => {
  toggleSearchDrawer();
};

const clearFilters = () => {
  localFilters.value = {
    query: "",
    genres: [],
    year: undefined,
    vote_average_gte: undefined,
  };
  clearStoreFilters();
};

// Sync localFilters with store's searchFilters when drawer opens
watch(isOpen, (newValue) => {
  if (newValue) {
    // Load genres if not loaded
    if (genres.value.length === 0) {
      genresLoading.value = true;
      fetchGenres().finally(() => {
        genresLoading.value = false;
      });
    }
    
    // Sync localFilters with store's searchFilters to preserve values
    if (searchFilters.value) {
      localFilters.value = {
        query: searchFilters.value.query || "",
        genres: searchFilters.value.genres || [],
        year: searchFilters.value.year,
        vote_average_gte: searchFilters.value.vote_average_gte,
      };
    }
  }
});

// Handle Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isOpen.value) {
    closeDrawer();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  
  // Sync localFilters with store's searchFilters on mount if filters exist
  if (searchFilters.value) {
    localFilters.value = {
      query: searchFilters.value.query || "",
      genres: searchFilters.value.genres || [],
      year: searchFilters.value.year,
      vote_average_gte: searchFilters.value.vote_average_gte,
    };
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  if (debounceTimeout) clearTimeout(debounceTimeout);
});
</script>

<style scoped>
/* Drawer transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease-in-out;
}

.drawer-enter-from {
  transform: translateX(-100%);
}

.drawer-enter-to {
  transform: translateX(0);
}

.drawer-leave-from {
  transform: translateX(0);
}

.drawer-leave-to {
  transform: translateX(-100%);
}

/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.backdrop-enter-to,
.backdrop-leave-from {
  opacity: 1;
}

/* Slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.backdrop-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

