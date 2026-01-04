<template>
  <nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <router-link 
        to="/" 
        @click="handleLogoClick"
        class="text-2xl font-bold text-white"
      >
        MovieDB
      </router-link>
      <div class="hidden md:flex space-x-6">
        <router-link to="/" class="nav-link"
          >Popular</router-link
        >
        <router-link to="/now-playing" class="nav-link"
          >Now Playing</router-link
        >
        <router-link to="/top-rated" class="nav-link"
          >Top Rated</router-link
        >
        <button 
          @click="toggleSearchDrawer" 
          :class="['nav-link', { 'nav-link-active': searchDrawerOpen }]"
        >
          Search
        </button>
        <span class="text-gray-500 mx-2 font-bold">|</span>
        <router-link to="/tv" class="nav-link"
          >Popular TV</router-link
        >
        <router-link to="/tv/on-the-air" class="nav-link"
          >On The Air</router-link
        >
        <router-link to="/tv/top-rated" class="nav-link"
          >Top Rated TV</router-link
        >
        <router-link to="/tv/search" class="nav-link"
          >Search TV</router-link
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
        class="nav-link-mobile"
        >Popular</router-link
      >
      <router-link
        to="/now-playing"
        @click="toggleMenu"
        class="nav-link-mobile"
        >Now Playing</router-link
      >
      <router-link
        to="/top-rated"
        @click="toggleMenu"
        class="nav-link-mobile"
        >Top Rated</router-link
      >
      <button
        @click="handleMobileSearchClick"
        :class="['nav-link-mobile', 'w-full', 'text-left', { 'nav-link-active': searchDrawerOpen }]"
      >
        Search
      </button>
      <div class="border-t border-gray-700 my-2"></div>
      <router-link
        to="/tv"
        @click="toggleMenu"
        class="nav-link-mobile"
        >Popular TV</router-link
      >
      <router-link
        to="/tv/on-the-air"
        @click="toggleMenu"
        class="nav-link-mobile"
        >On The Air</router-link
      >
      <router-link
        to="/tv/top-rated"
        @click="toggleMenu"
        class="nav-link-mobile"
        >Top Rated TV</router-link
      >
      <router-link
        to="/tv/search"
        @click="toggleMenu"
        class="nav-link-mobile"
        >Search TV</router-link
      >
    </div>
    <SearchDrawer />
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useMovieStore } from "../stores/movieStore";
import SearchDrawer from "./SearchDrawer.vue";

const store = useMovieStore();
const { searchDrawerOpen, hasActiveFilters } = storeToRefs(store);
const { toggleSearchDrawer, clearFilters } = store;

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const handleMobileSearchClick = () => {
  toggleMenu();
  toggleSearchDrawer();
};

const handleLogoClick = () => {
  // Clear filters when clicking logo to ensure home page shows correctly
  if (hasActiveFilters.value) {
    clearFilters();
  }
};
</script>

<style scoped>
/* Desktop navigation links */
.nav-link {
  color: white;
  text-decoration: none;
  display: inline-block;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #60a5fa; /* blue-400 */
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active,
.nav-link-active {
  color: #60a5fa; /* blue-400 */
}

/* Button styled as link */
button.nav-link {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}

/* Mobile navigation links */
.nav-link-mobile {
  display: block;
  padding: 0.5rem 0;
  color: white;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link-mobile:hover {
  color: #60a5fa; /* blue-400 */
}

.nav-link-mobile.router-link-active,
.nav-link-mobile.router-link-exact-active,
button.nav-link-mobile.nav-link-active {
  color: #60a5fa; /* blue-400 */
}

button.nav-link-mobile {
  background: none;
  border: none;
  padding: 0.5rem 0;
  margin: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  text-align: left;
  width: 100%;
}
</style>
