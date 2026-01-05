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
      class="fixed left-0 top-0 h-full w-full md:w-96 bg-gray-800 z-50 shadow-2xl flex flex-col overflow-y-auto"
      @click.stop
    >
      <div class="p-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-xl font-bold text-white">Search & Filter</h2>
          <button
            @click="closeDrawer"
            class="text-gray-400 hover:text-white transition-colors"
            aria-label="Close drawer"
          >
            <svg
              class="w-5 h-5"
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
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            Search {{ type === 'tv' ? 'TV Shows' : 'Movies' }}
          </label>
          <input
            v-model="localFilters.query"
            type="text"
            :placeholder="`Enter ${type === 'tv' ? 'TV show' : 'movie'} title...`"
            class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedApplyFilters"
          />
        </div>

        <!-- Genres -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-300 mb-1.5">
            Genres
          </label>
          <div
            v-if="genresLoading"
            class="text-gray-400 text-xs"
          >
            Loading genres...
          </div>
          <div
            v-else
            class="grid grid-cols-2 gap-1"
          >
            <label
              v-for="genre in genres"
              :key="genre.id"
              class="flex items-center cursor-pointer hover:bg-gray-700 p-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                :value="genre.id"
                v-model="localFilters.genres"
                class="w-3 h-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-1"
                @change="debouncedApplyFilters"
              />
              <span class="ml-1.5 text-xs text-gray-300">{{ genre.name }}</span>
            </label>
          </div>
        </div>

        <!-- Year -->
        <div class="mb-3" v-if="type === 'movie'">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            Release Year
          </label>
          <input
            v-model.number="localFilters.year"
            type="number"
            min="1900"
            :max="currentYear"
            placeholder="e.g. 2020"
            class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedApplyFilters"
          />
        </div>
        
        <!-- First Air Date Year (TV Shows) -->
        <div class="mb-3" v-if="type === 'tv'">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            First Air Date Year
          </label>
          <input
            v-model.number="localFilters.first_air_date_year"
            type="number"
            min="1900"
            :max="currentYear"
            placeholder="e.g. 2020"
            class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedApplyFilters"
          />
        </div>

        <!-- Minimum Rating -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-300 mb-1">
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
          <div class="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        <!-- Language -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            Language
          </label>
          <select
            v-model="localFilters.language"
            class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="debouncedApplyFilters"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <!-- Runtime -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            Runtime
          </label>
          <select
            v-model="selectedRuntime"
            class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="debouncedApplyFilters"
          >
            <option value="">Any Runtime</option>
            <option value="under_60">Under 60 minutes</option>
            <option value="60_90">60-90 minutes</option>
            <option value="90_120">90-120 minutes</option>
            <option value="120_150">120-150 minutes</option>
            <option value="over_150">Over 150 minutes</option>
          </select>
        </div>

        <!-- Release Date Range (Movies) -->
        <div class="mb-3" v-if="type === 'movie'">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            Release Date Range
          </label>
          <div class="space-y-2">
            <div>
              <label class="block text-xs text-gray-400 mb-1">From Date</label>
              <input
                v-model="localFilters.release_date_from"
                type="date"
                class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="debouncedApplyFilters"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">To Date</label>
              <input
                v-model="localFilters.release_date_to"
                type="date"
                class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="validateDates"
              />
            </div>
            <div v-if="dateError" class="text-xs text-red-400 mt-1">
              {{ dateError }}
            </div>
          </div>
        </div>
        
        <!-- First Air Date Range (TV Shows) -->
        <div class="mb-3" v-if="type === 'tv'">
          <label class="block text-xs font-medium text-gray-300 mb-1">
            First Air Date Range
          </label>
          <div class="space-y-2">
            <div>
              <label class="block text-xs text-gray-400 mb-1">From Date</label>
              <input
                v-model="localFilters.first_air_date_from"
                type="date"
                class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="debouncedApplyFilters"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">To Date</label>
              <input
                v-model="localFilters.first_air_date_to"
                type="date"
                class="w-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="validateDates"
              />
            </div>
            <div v-if="dateError" class="text-xs text-red-400 mt-1">
              {{ dateError }}
            </div>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <button
          @click="clearFilters"
          class="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
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
import { useTVStore } from "../stores/tvStore";

const props = withDefaults(defineProps<{
  type?: 'movie' | 'tv';
}>(), {
  type: 'movie'
});

const movieStore = useMovieStore();
const tvStore = useTVStore();

// Use the appropriate store based on type
const store = props.type === 'tv' ? tvStore : movieStore;
const { searchDrawerOpen, genres, filteredResults, searchFilters } = storeToRefs(store);
const { toggleSearchDrawer, applyFilters, clearFilters: clearStoreFilters, fetchGenres } = store;

const isOpen = computed(() => searchDrawerOpen.value);

// Runtime options
const runtimeOptions = [
  { value: '', label: 'Any Runtime', min: undefined, max: undefined },
  { value: 'under_60', label: 'Under 60 minutes', min: undefined, max: 59 },
  { value: '60_90', label: '60-90 minutes', min: 60, max: 90 },
  { value: '90_120', label: '90-120 minutes', min: 90, max: 120 },
  { value: '120_150', label: '120-150 minutes', min: 120, max: 150 },
  { value: 'over_150', label: 'Over 150 minutes', min: 151, max: undefined },
];

// Local filter state - sync with store's searchFilters
const localFilters = ref({
  query: "",
  genres: [] as number[],
  year: undefined as number | undefined,
  first_air_date_year: undefined as number | undefined,
  vote_average_gte: undefined as number | undefined,
  language: undefined as string | undefined,
  runtime_min: undefined as number | undefined,
  runtime_max: undefined as number | undefined,
  release_date_from: undefined as string | undefined,
  release_date_to: undefined as string | undefined,
  first_air_date_from: undefined as string | undefined,
  first_air_date_to: undefined as string | undefined,
});

const genresLoading = ref(false);
const currentYear = new Date().getFullYear();
const dateError = ref("");

// Runtime computed property
const selectedRuntime = computed({
  get: () => {
    const option = runtimeOptions.find(opt => 
      opt.min === localFilters.value.runtime_min && 
      opt.max === localFilters.value.runtime_max
    );
    return option?.value || '';
  },
  set: (value: string) => {
    const option = runtimeOptions.find(opt => opt.value === value);
    localFilters.value.runtime_min = option?.min;
    localFilters.value.runtime_max = option?.max;
  }
});

// Date validation
const validateDates = () => {
  if (props.type === 'movie') {
    if (localFilters.value.release_date_from && localFilters.value.release_date_to) {
      if (localFilters.value.release_date_to < localFilters.value.release_date_from) {
        dateError.value = "To date must be greater than or equal to from date";
        return false;
      }
    }
  } else {
    if (localFilters.value.first_air_date_from && localFilters.value.first_air_date_to) {
      if (localFilters.value.first_air_date_to < localFilters.value.first_air_date_from) {
        dateError.value = "To date must be greater than or equal to from date";
        return false;
      }
    }
  }
  dateError.value = "";
  debouncedApplyFilters();
  return true;
};

let debounceTimeout: number | null = null;

const debouncedApplyFilters = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (!dateError.value) {
      // Map localFilters to the correct format for the store
      const filtersToApply = props.type === 'tv' 
        ? {
            query: localFilters.value.query,
            genres: localFilters.value.genres,
            first_air_date_year: localFilters.value.first_air_date_year,
            vote_average_gte: localFilters.value.vote_average_gte,
            language: localFilters.value.language,
            runtime_min: localFilters.value.runtime_min,
            runtime_max: localFilters.value.runtime_max,
            first_air_date_from: localFilters.value.first_air_date_from,
            first_air_date_to: localFilters.value.first_air_date_to,
          }
        : {
            query: localFilters.value.query,
            genres: localFilters.value.genres,
            year: localFilters.value.year,
            vote_average_gte: localFilters.value.vote_average_gte,
            language: localFilters.value.language,
            runtime_min: localFilters.value.runtime_min,
            runtime_max: localFilters.value.runtime_max,
            release_date_from: localFilters.value.release_date_from,
            release_date_to: localFilters.value.release_date_to,
          };
      applyFilters(filtersToApply);
    }
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
    first_air_date_year: undefined,
    vote_average_gte: undefined,
    language: undefined,
    runtime_min: undefined,
    runtime_max: undefined,
    release_date_from: undefined,
    release_date_to: undefined,
    first_air_date_from: undefined,
    first_air_date_to: undefined,
  };
  dateError.value = "";
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
        year: (searchFilters.value as any).year,
        first_air_date_year: (searchFilters.value as any).first_air_date_year,
        vote_average_gte: searchFilters.value.vote_average_gte,
        language: searchFilters.value.language,
        runtime_min: searchFilters.value.runtime_min,
        runtime_max: searchFilters.value.runtime_max,
        release_date_from: (searchFilters.value as any).release_date_from,
        release_date_to: (searchFilters.value as any).release_date_to,
        first_air_date_from: (searchFilters.value as any).first_air_date_from,
        first_air_date_to: (searchFilters.value as any).first_air_date_to,
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
      year: (searchFilters.value as any).year,
      first_air_date_year: (searchFilters.value as any).first_air_date_year,
      vote_average_gte: searchFilters.value.vote_average_gte,
      language: searchFilters.value.language,
      runtime_min: searchFilters.value.runtime_min,
      runtime_max: searchFilters.value.runtime_max,
      release_date_from: (searchFilters.value as any).release_date_from,
      release_date_to: (searchFilters.value as any).release_date_to,
      first_air_date_from: (searchFilters.value as any).first_air_date_from,
      first_air_date_to: (searchFilters.value as any).first_air_date_to,
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

