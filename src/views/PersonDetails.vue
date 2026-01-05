<template>
  <div class="min-h-screen bg-gray-900 text-white pb-32">
    <Navbar />
    
    <!-- Back Button -->
    <div class="container mx-auto px-4 pt-6">
      <button
        @click="goBack"
        class="back-button flex items-center text-gray-300 hover:text-white transition-colors mb-6"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span>Back</span>
      </button>
    </div>

    <!-- Main Content -->
    <div v-if="personDetails" class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left Column - Profile Image and Info -->
        <div class="w-full lg:w-80 flex-shrink-0">
          <div class="mb-6">
            <img
              v-if="personDetails.profile_path"
              :src="`https://image.tmdb.org/t/p/w500${personDetails.profile_path}`"
              :alt="personDetails.name"
              class="w-full rounded-lg shadow-2xl"
            />
            <div
              v-else
              class="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center"
            >
              <svg class="w-32 h-32 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Personal Info -->
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-3">Personal Info</h3>
              <div class="space-y-3 text-sm">
                <div v-if="personDetails.known_for_department">
                  <div class="font-semibold text-gray-400">Known For</div>
                  <div class="text-gray-300">{{ personDetails.known_for_department }}</div>
                </div>
                <div v-if="personDetails.known_for_department">
                  <div class="font-semibold text-gray-400">Known Credits</div>
                  <div class="text-gray-300">{{ totalCredits }}</div>
                </div>
                <div v-if="personDetails.gender !== undefined">
                  <div class="font-semibold text-gray-400">Gender</div>
                  <div class="text-gray-300">{{ personDetails.gender === 1 ? 'Female' : personDetails.gender === 2 ? 'Male' : 'Non-binary' }}</div>
                </div>
                <div v-if="personDetails.birthday">
                  <div class="font-semibold text-gray-400">Birthday</div>
                  <div class="text-gray-300">
                    {{ formatDate(personDetails.birthday) }}
                    <span v-if="personDetails.birthday" class="text-gray-500">
                      ({{ calculateAge(personDetails.birthday) }} years old)
                    </span>
                  </div>
                </div>
                <div v-if="personDetails.place_of_birth">
                  <div class="font-semibold text-gray-400">Place of Birth</div>
                  <div class="text-gray-300">{{ personDetails.place_of_birth }}</div>
                </div>
                <div v-if="personDetails.also_known_as && personDetails.also_known_as.length > 0">
                  <div class="font-semibold text-gray-400">Also Known As</div>
                  <div class="text-gray-300 space-y-1">
                    <div v-for="(name, index) in personDetails.also_known_as" :key="index">{{ name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Main Content -->
        <div class="flex-1">
          <!-- Name and Title -->
          <div class="mb-6">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ personDetails.name }}</h1>
          </div>

          <!-- Biography -->
          <div v-if="personDetails.biography" class="mb-8">
            <h2 class="text-2xl font-bold mb-4">Biography</h2>
            <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{ personDetails.biography }}</p>
          </div>

          <!-- Known For -->
          <div v-if="knownFor.length > 0" class="mb-8">
            <h2 class="text-2xl font-bold mb-4">Known For</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div
                v-for="item in knownFor"
                :key="item.id"
                class="cursor-pointer group"
                @click="goToDetails(item)"
              >
                <div class="mb-2">
                  <img
                    v-if="item.poster_path || item.backdrop_path"
                    :src="`https://image.tmdb.org/t/p/w300${item.poster_path || item.backdrop_path}`"
                    :alt="item.title || item.name"
                    class="w-full aspect-[2/3] object-cover rounded-lg group-hover:opacity-75 transition-opacity"
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
                <div class="font-semibold text-sm">{{ item.title || item.name }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ item.character || item.job }}</div>
              </div>
            </div>
          </div>

          <!-- Filmography -->
          <div v-if="credits" class="mb-8">
            <div class="flex items-center gap-4 mb-4 border-b border-gray-700">
              <h2 class="text-2xl font-bold pb-4">Filmography</h2>
              <div class="flex gap-1 pb-4 -mb-px">
                <button
                  v-for="filter in creditFilters"
                  :key="filter.id"
                  @click="activeCreditFilter = filter.id"
                  :class="[
                    'px-4 py-2 text-sm font-semibold transition-colors',
                    activeCreditFilter === filter.id
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-300'
                  ]"
                >
                  {{ filter.label }}
                  <span v-if="filter.count" class="ml-1 text-gray-500">({{ filter.count }})</span>
                </button>
              </div>
            </div>

            <!-- Acting Credits -->
            <div v-if="activeCreditFilter === 'acting' && actingCredits.length > 0" class="space-y-4">
              <div
                v-for="credit in actingCredits"
                :key="`${credit.media_type}-${credit.id}`"
                class="flex gap-4 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors"
                @click="goToDetails(credit)"
              >
                <div class="w-20 flex-shrink-0">
                  <img
                    v-if="credit.poster_path || credit.backdrop_path"
                    :src="`https://image.tmdb.org/t/p/w92${credit.poster_path || credit.backdrop_path}`"
                    :alt="credit.title || credit.name"
                    class="w-full aspect-[2/3] object-cover rounded"
                    @error="handleImageError"
                  />
                  <div
                    v-else
                    class="w-full aspect-[2/3] bg-gray-800 rounded flex items-center justify-center"
                  >
                    <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ credit.title || credit.name }}</div>
                  <div class="text-sm text-gray-400">{{ credit.character }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ credit.release_date ? new Date(credit.release_date).getFullYear() : credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : '—' }}
                    <span v-if="credit.media_type === 'tv'"> • TV Series</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Production Credits -->
            <div v-if="activeCreditFilter === 'production' && productionCredits.length > 0" class="space-y-4">
              <div
                v-for="credit in productionCredits"
                :key="`${credit.media_type}-${credit.id}`"
                class="flex gap-4 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors"
                @click="goToDetails(credit)"
              >
                <div class="w-20 flex-shrink-0">
                  <img
                    v-if="credit.poster_path || credit.backdrop_path"
                    :src="`https://image.tmdb.org/t/p/w92${credit.poster_path || credit.backdrop_path}`"
                    :alt="credit.title || credit.name"
                    class="w-full aspect-[2/3] object-cover rounded"
                    @error="handleImageError"
                  />
                  <div
                    v-else
                    class="w-full aspect-[2/3] bg-gray-800 rounded flex items-center justify-center"
                  >
                    <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ credit.title || credit.name }}</div>
                  <div class="text-sm text-gray-400">{{ credit.job }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ credit.release_date ? new Date(credit.release_date).getFullYear() : credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : '—' }}
                    <span v-if="credit.media_type === 'tv'"> • TV Series</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Directing Credits -->
            <div v-if="activeCreditFilter === 'directing' && directingCredits.length > 0" class="space-y-4">
              <div
                v-for="credit in directingCredits"
                :key="`${credit.media_type}-${credit.id}`"
                class="flex gap-4 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors"
                @click="goToDetails(credit)"
              >
                <div class="w-20 flex-shrink-0">
                  <img
                    v-if="credit.poster_path || credit.backdrop_path"
                    :src="`https://image.tmdb.org/t/p/w92${credit.poster_path || credit.backdrop_path}`"
                    :alt="credit.title || credit.name"
                    class="w-full aspect-[2/3] object-cover rounded"
                    @error="handleImageError"
                  />
                  <div
                    v-else
                    class="w-full aspect-[2/3] bg-gray-800 rounded flex items-center justify-center"
                  >
                    <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ credit.title || credit.name }}</div>
                  <div class="text-sm text-gray-400">{{ credit.job }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ credit.release_date ? new Date(credit.release_date).getFullYear() : credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : '—' }}
                    <span v-if="credit.media_type === 'tv'"> • TV Series</span>
                  </div>
                </div>
              </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { usePersonStore } from "../stores/personStore";
import Navbar from "../components/Navbar.vue";

const route = useRoute();
const router = useRouter();
const store = usePersonStore();
const { personDetails, personCredits, loading, error } = storeToRefs(store);
const { fetchPersonDetails } = store;

const activeCreditFilter = ref<'acting' | 'production' | 'directing'>('acting');

const goBack = () => {
  router.back();
};

const loadPersonDetails = () => {
  const id = route.params.id as string;
  if (id) {
    fetchPersonDetails(id);
  }
};

// Get total credits count
const totalCredits = computed(() => {
  if (!personCredits.value) return 0;
  return (personCredits.value.cast?.length || 0) + (personCredits.value.crew?.length || 0);
});

// Get known for items (top 8 most popular)
const knownFor = computed(() => {
  if (!personCredits.value) return [];
  const allCredits = [
    ...(personCredits.value.cast || []),
    ...(personCredits.value.crew || []),
  ];
  return allCredits
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 8);
});

// Get credits
const credits = computed(() => {
  return personCredits.value;
});

// Get acting credits (sorted by release date, most recent first)
const actingCredits = computed(() => {
  if (!personCredits.value?.cast) return [];
  return [...personCredits.value.cast].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || '';
    const dateB = b.release_date || b.first_air_date || '';
    return dateB.localeCompare(dateA);
  });
});

// Get production credits
const productionCredits = computed(() => {
  if (!personCredits.value?.crew) return [];
  return personCredits.value.crew
    .filter((credit: any) => 
      credit.department === 'Production' || 
      credit.job?.toLowerCase().includes('producer')
    )
    .sort((a: any, b: any) => {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      return dateB.localeCompare(dateA);
    });
});

// Get directing credits
const directingCredits = computed(() => {
  if (!personCredits.value?.crew) return [];
  return personCredits.value.crew
    .filter((credit: any) => 
      credit.department === 'Directing' || 
      credit.job?.toLowerCase().includes('director')
    )
    .sort((a: any, b: any) => {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      return dateB.localeCompare(dateA);
    });
});

// Credit filters
const creditFilters = computed(() => [
  { id: 'acting' as const, label: 'Acting', count: actingCredits.value.length },
  { id: 'production' as const, label: 'Production', count: productionCredits.value.length },
  { id: 'directing' as const, label: 'Directing', count: directingCredits.value.length },
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

// Calculate age
const calculateAge = (birthday: string) => {
  if (!birthday) return 0;
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
};

// Navigate to movie/TV details
const goToDetails = (item: any) => {
  if (item.media_type === 'tv') {
    router.push(`/tv/${item.id}`);
  } else {
    router.push(`/movie/${item.id}`);
  }
};

// Set default filter based on available credits
watch([actingCredits, productionCredits, directingCredits], () => {
  if (actingCredits.value.length > 0) {
    activeCreditFilter.value = 'acting';
  } else if (productionCredits.value.length > 0) {
    activeCreditFilter.value = 'production';
  } else if (directingCredits.value.length > 0) {
    activeCreditFilter.value = 'directing';
  }
}, { immediate: true });

onMounted(() => {
  loadPersonDetails();
});

// Watch for route parameter changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadPersonDetails();
      activeCreditFilter.value = 'acting';
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

