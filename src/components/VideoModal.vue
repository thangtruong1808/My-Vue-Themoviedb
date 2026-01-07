<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <button
      @click="$emit('close')"
      class="absolute top-4 right-4 text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-white z-10"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div class="w-full max-w-4xl aspect-video">
      <iframe
        :src="`https://www.youtube.com/embed/${videoKey}?autoplay=1`"
        class="w-full h-full rounded-lg"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  videoKey: string;
}

defineProps<Props>();

defineEmits<{
  close: [];
}>();
</script>

