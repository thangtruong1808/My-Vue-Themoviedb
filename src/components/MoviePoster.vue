<template>
  <div class="relative w-full bg-gray-800 flex items-center justify-center overflow-hidden" :class="containerClass">
    <!-- Loading state -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
      <div class="w-full h-full bg-gray-700"></div>
    </div>
    
    <!-- Error state / Fallback -->
    <div v-if="error" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-500">
      <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-sm">No Image</span>
    </div>
    
    <!-- Image -->
    <img
      v-if="!error"
      :src="imageUrl"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  posterPath: string | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  size?: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
  objectFit?: 'contain' | 'cover';
  containerClass?: string;
  imageClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 'auto',
  size: 'w500',
  objectFit: 'contain',
  containerClass: '',
  imageClass: '',
});

const loading = ref(true);
const error = ref(false);

// Build TMDB image URL
const imageUrl = computed(() => {
  if (!props.posterPath) {
    error.value = true;
    return '';
  }
  
  // Handle cases where poster_path might already include the base URL
  if (props.posterPath.startsWith('http')) {
    return props.posterPath;
  }
  
  return `https://image.tmdb.org/t/p/${props.size}${props.posterPath}`;
});

// Image style based on objectFit
const imageStyle = computed(() => {
  const style: Record<string, string> = {
    objectFit: props.objectFit,
  };
  
  // Only set width/height if explicitly provided
  if (props.width !== '100%') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  } else {
    style.width = '100%';
  }
  
  if (props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  } else {
    style.height = 'auto';
  }
  
  // If using contain, ensure image doesn't exceed container
  if (props.objectFit === 'contain') {
    style.maxWidth = '100%';
    style.maxHeight = '100%';
  }
  
  return style;
});

const handleLoad = () => {
  loading.value = false;
  error.value = false;
};

const handleError = () => {
  loading.value = false;
  error.value = true;
};
</script>

<style scoped>
img {
  transition: opacity 0.3s ease-in-out;
}

img[src=""] {
  display: none;
}
</style>

