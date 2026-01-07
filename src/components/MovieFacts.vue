<template>
  <div :class="['space-y-6', mobileClass]">
    <!-- Mobile Poster -->
    <div v-if="showMobilePoster && movieDetails" class="md:hidden mb-6">
      <MoviePoster
        :poster-path="movieDetails.poster_path"
        :alt="movieDetails.title"
        size="w500"
        object-fit="contain"
        container-class="w-full rounded-lg"
        image-class="rounded-lg"
      />
    </div>

    <!-- Facts Grid (Mobile) -->
    <div v-if="variant === 'mobile'" class="grid grid-cols-2 gap-6">
      <div v-if="movieDetails?.status">
        <h3 class="font-semibold mb-2">Status</h3>
        <p class="text-gray-700 dark:text-gray-300">{{ movieDetails.status }}</p>
      </div>

      <div v-if="movieDetails?.original_language">
        <h3 class="font-semibold mb-2">Original Language</h3>
        <p class="text-gray-300">{{ movieDetails.original_language.toUpperCase() }}</p>
      </div>

      <div v-if="movieDetails?.budget">
        <h3 class="font-semibold mb-2">Budget</h3>
        <p class="text-gray-300">${{ formatCurrency(movieDetails.budget) }}</p>
      </div>

      <div v-if="movieDetails?.revenue">
        <h3 class="font-semibold mb-2">Revenue</h3>
        <p class="text-gray-300">${{ formatCurrency(movieDetails.revenue) }}</p>
      </div>

      <div v-if="movieDetails?.keywords?.keywords && movieDetails.keywords.keywords.length > 0" class="col-span-2">
        <h3 class="font-semibold mb-2">Keywords</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="keyword in movieDetails.keywords.keywords"
            :key="keyword.id"
            class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            {{ keyword.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Facts List (Desktop) -->
    <template v-else>
      <div v-if="movieDetails?.status">
        <h3 class="font-semibold mb-2">Status</h3>
        <p class="text-gray-400 dark:text-gray-400">{{ movieDetails.status }}</p>
      </div>

      <div v-if="movieDetails?.original_language">
        <h3 class="font-semibold mb-2">Original Language</h3>
        <p class="text-gray-400 dark:text-gray-400">{{ movieDetails.original_language.toUpperCase() }}</p>
      </div>

      <div v-if="movieDetails?.budget">
        <h3 class="font-semibold mb-2">Budget</h3>
        <p class="text-gray-400 dark:text-gray-400">${{ formatCurrency(movieDetails.budget) }}</p>
      </div>

      <div v-if="movieDetails?.revenue">
        <h3 class="font-semibold mb-2">Revenue</h3>
        <p class="text-gray-400 dark:text-gray-400">${{ formatCurrency(movieDetails.revenue) }}</p>
      </div>

      <div v-if="movieDetails?.keywords?.keywords && movieDetails.keywords.keywords.length > 0">
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
    </template>

    <!-- Genres -->
    <div v-if="movieDetails?.genres && movieDetails.genres.length > 0" :class="variant === 'mobile' ? 'mt-6' : 'mt-6'">
      <h3 class="font-semibold mb-2">Genres</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="genre in movieDetails.genres"
          :key="genre.id"
          :class="[
            'px-2 py-1 rounded text-sm',
            variant === 'mobile'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              : 'bg-gray-800 text-gray-300'
          ]"
        >
          {{ genre.name }}
        </span>
      </div>
    </div>

    <!-- Production Companies -->
    <div v-if="movieDetails?.production_companies && movieDetails.production_companies.length > 0" :class="variant === 'mobile' ? 'mt-6' : 'mt-6'">
      <h3 class="font-semibold mb-2">Production Companies</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="company in movieDetails.production_companies"
          :key="company.id"
          :class="[
            'px-2 py-1 rounded text-sm',
            variant === 'mobile'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              : 'bg-gray-800 text-gray-300'
          ]"
        >
          {{ company.name }}
        </span>
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

interface Keyword {
  id: number;
  name: string;
}

interface ProductionCompany {
  id: number;
  name: string;
}

interface MovieDetails {
  title: string;
  poster_path?: string | null;
  status?: string;
  original_language?: string;
  budget?: number;
  revenue?: number;
  genres?: Genre[];
  keywords?: {
    keywords: Keyword[];
  };
  production_companies?: ProductionCompany[];
}

interface Props {
  movieDetails: MovieDetails | null;
  variant?: 'mobile' | 'desktop';
  showMobilePoster?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'desktop',
  showMobilePoster: false,
});

const mobileClass = computed(() => {
  return props.variant === 'mobile' ? 'mb-8 lg:hidden order-2' : '';
});

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US').format(amount);
};
</script>

