<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
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
    <img
      :src="imageUrl"
      alt="Full size"
      class="max-w-full max-h-[90vh] object-contain"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  imageUrl: string;
}

defineProps<Props>();

defineEmits<{
  close: [];
}>();
</script>

