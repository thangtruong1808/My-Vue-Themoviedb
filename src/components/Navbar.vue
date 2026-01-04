<template>
  <nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-2xl font-bold text-white"
        >MovieDB</router-link
      >
      <div class="hidden md:flex space-x-6">
        <router-link to="/" class="text-white hover:text-blue-400"
          >Popular</router-link
        >
        <router-link to="/now-playing" class="text-white hover:text-blue-400"
          >Now Playing</router-link
        >
        <router-link to="/top-rated" class="text-white hover:text-blue-400"
          >Top Rated</router-link
        >
        <router-link to="/search" class="text-white hover:text-blue-400"
          >Search</router-link
        >
      </div>
      <div class="md:hidden">
        <button @click="toggleMenu" class="text-white">
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
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="menuOpen" class="md:hidden mt-4">
      <router-link
        to="/"
        @click="toggleMenu"
        class="block py-2 text-white hover:text-blue-400"
        >Popular</router-link
      >
      <router-link
        to="/now-playing"
        @click="toggleMenu"
        class="block py-2 text-white hover:text-blue-400"
        >Now Playing</router-link
      >
      <router-link
        to="/top-rated"
        @click="toggleMenu"
        class="block py-2 text-white hover:text-blue-400"
        >Top Rated</router-link
      >
      <router-link
        to="/search"
        @click="toggleMenu"
        class="block py-2 text-white hover:text-blue-400"
        >Search</router-link
      >
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
</script>
