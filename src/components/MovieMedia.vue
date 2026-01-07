<template>
  <div class="mb-8 order-4">
    <div class="flex items-center gap-4 mb-4 border-b border-gray-700">
      <h2 class="text-2xl font-bold pb-4">Media</h2>
      <div class="flex gap-1 pb-4 -mb-px">
        <button
          v-for="tab in mediaTabs"
          :key="tab.id"
          @click="$emit('tab-change', tab.id)"
          :class="[
            'px-4 py-2 text-sm font-semibold transition-colors',
            activeTab === tab.id
              ? 'text-gray-900 dark:text-white border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1 text-gray-500 dark:text-gray-400">({{ tab.count }})</span>
        </button>
      </div>
    </div>

    <!-- Videos Tab -->
    <div v-if="activeTab === 'videos' && videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="video in videos.slice(0, 6)"
        :key="video.id"
        class="cursor-pointer group"
        @click="$emit('video-click', video.key)"
      >
        <div class="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
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
        <div class="text-xs text-gray-600 dark:text-gray-400">{{ video.type }}</div>
      </div>
    </div>
    <div v-else-if="activeTab === 'videos'" class="text-gray-600 dark:text-gray-400 py-8 text-center">
      No videos available
    </div>

    <!-- Backdrops Tab -->
    <div v-if="activeTab === 'backdrops' && backdrops.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="backdrop in backdrops.slice(0, 12)"
        :key="backdrop.file_path"
        class="cursor-pointer group"
        @click="$emit('image-click', `https://image.tmdb.org/t/p/original${backdrop.file_path}`)"
      >
        <img
          :src="`https://image.tmdb.org/t/p/w780${backdrop.file_path}`"
          alt="Backdrop"
          class="w-full aspect-video object-cover rounded-lg group-hover:opacity-75 transition-opacity"
        />
      </div>
    </div>
    <div v-else-if="activeTab === 'backdrops'" class="text-gray-600 dark:text-gray-400 py-8 text-center">
      No backdrops available
    </div>

    <!-- Posters Tab -->
    <div v-if="activeTab === 'posters' && posters.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div
        v-for="poster in posters.slice(0, 18)"
        :key="poster.file_path"
        class="cursor-pointer group"
        @click="$emit('image-click', `https://image.tmdb.org/t/p/original${poster.file_path}`)"
      >
        <img
          :src="`https://image.tmdb.org/t/p/w500${poster.file_path}`"
          alt="Poster"
          class="w-full aspect-[2/3] object-cover rounded-lg group-hover:opacity-75 transition-opacity"
        />
      </div>
    </div>
    <div v-else-if="activeTab === 'posters'" class="text-gray-600 dark:text-gray-400 py-8 text-center">
      No posters available
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
}

interface Image {
  file_path: string;
}

interface Props {
  videos: Video[];
  backdrops: Image[];
  posters: Image[];
  activeTab: 'videos' | 'backdrops' | 'posters';
}

const props = defineProps<Props>();

defineEmits<{
  'tab-change': [tab: 'videos' | 'backdrops' | 'posters'];
  'video-click': [key: string];
  'image-click': [url: string];
}>();

const mediaTabs = computed(() => [
  { id: 'videos' as const, label: 'Videos', count: props.videos.length },
  { id: 'backdrops' as const, label: 'Backdrops', count: props.backdrops.length },
  { id: 'posters' as const, label: 'Posters', count: props.posters.length },
]);

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
};
</script>

