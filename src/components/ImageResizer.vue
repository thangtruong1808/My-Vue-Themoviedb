<template>
  <div 
    class="image-resizer-container" 
    :style="containerStyle"
    ref="containerRef"
  >
    <!-- Loading skeleton -->
    <div v-if="loading" class="image-skeleton" :style="skeletonStyle">
      <div class="skeleton-content"></div>
    </div>
    
    <!-- Error/No image state -->
    <div v-if="error" class="image-error" :style="errorStyle">
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="error-text">No Image</span>
    </div>
    
    <!-- Image -->
    <img
      v-if="!error && imageUrl"
      :src="imageUrl"
      :alt="alt"
      class="resized-image"
      :style="imageStyle"
      @load="handleImageLoad"
      @error="handleImageError"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, type CSSProperties } from 'vue';

interface Props {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  preserveAspectRatio?: boolean;
  fitMode?: 'contain' | 'cover' | 'fill';
  backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 'auto',
  preserveAspectRatio: true,
  fitMode: 'contain',
  backgroundColor: '#1f2937', // gray-800
});

const containerRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref(false);
const imageUrl = ref<string>('');
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const containerWidth = ref(0);
const containerHeight = ref(0);

// Container style
const containerStyle = computed((): CSSProperties => {
  const style: CSSProperties = {
    position: 'relative',
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    backgroundColor: props.backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };
  
  // For contain mode, allow height to adjust to preserve full content
  if (props.fitMode === 'contain' && props.preserveAspectRatio) {
    // Height will be determined by the image aspect ratio
    style.height = 'auto';
    style.minHeight = typeof props.height === 'number' ? `${props.height}px` : props.height;
  } else {
    // For cover mode, use fixed height
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  return style;
});

// Image style - calculates proper dimensions to preserve content
const imageStyle = computed((): CSSProperties => {
  if (!naturalWidth.value || !naturalHeight.value) {
    return {
      width: '100%',
      height: '100%',
      objectFit: props.fitMode,
      display: 'block',
    };
  }
  
  const style: CSSProperties = {
    objectFit: props.fitMode,
    display: 'block',
  };

  if (props.fitMode === 'contain') {
    // Always fill width to ensure full width display, height adjusts to maintain aspect ratio
    // This preserves all content while ensuring full width
    style.width = '100%';
    style.height = 'auto';
    style.objectFit = 'contain';
    style.display = 'block';
  } else if (props.fitMode === 'cover') {
    // Fill container width and height, may crop but won't distort - ensures full width display
    style.width = '100%';
    style.height = '100%';
    style.objectFit = 'cover';
    style.objectPosition = 'center';
  } else {
    // Fill - may distort
    style.width = '100%';
    style.height = '100%';
    style.objectFit = 'fill';
  }

  return style;
});

// Skeleton style
const skeletonStyle = computed((): CSSProperties => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: '#374151', // gray-700
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Error style
const errorStyle = computed((): CSSProperties => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: props.backgroundColor,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6b7280', // gray-500
}));

// Update image URL when src changes
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    loading.value = true;
    error.value = false;
    imageUrl.value = newSrc;
  } else {
    error.value = true;
    loading.value = false;
  }
}, { immediate: true });

// Update container dimensions
const updateContainerDimensions = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth;
    containerHeight.value = containerRef.value.clientHeight;
  }
};

// Handle image load
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  naturalWidth.value = img.naturalWidth;
  naturalHeight.value = img.naturalHeight;
  loading.value = false;
  error.value = false;
  updateContainerDimensions();
};

// Handle image error
const handleImageError = () => {
  loading.value = false;
  error.value = true;
};

// Resize observer to update dimensions when container size changes
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value) {
    updateContainerDimensions();
    
    // Use ResizeObserver to track container size changes
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateContainerDimensions();
      });
      resizeObserver.observe(containerRef.value);
    }
  }
  
  // Initialize image URL
  if (props.src) {
    imageUrl.value = props.src;
  } else {
    error.value = true;
    loading.value = false;
  }
});

onUnmounted(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.image-resizer-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.resized-image {
  transition: opacity 0.3s ease-in-out;
}

.resized-image[src=""] {
  display: none;
}

.image-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-content {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #374151 25%,
    #4b5563 50%,
    #374151 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.error-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>

