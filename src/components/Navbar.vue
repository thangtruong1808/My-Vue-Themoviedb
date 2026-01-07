<template>
  <nav class="bg-gray-100 dark:bg-gray-800 p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 top-0 sticky z-50">
    <div class="container mx-auto flex justify-between items-center flex-wrap gap-2">
      <router-link 
        to="/" 
        @click="handleLogoClick"
        class="text-2xl font-bold text-black dark:text-white"
      >
        MovieDB
      </router-link>
      <div class="hidden md:flex items-center flex-wrap gap-x-3 gap-y-2">
        <!-- Movies Section -->
        <div class="text-black dark:text-gray-400 flex items-center gap-x-3">
          <router-link to="/" class="nav-link whitespace-nowrap"
            >Popular Movies</router-link
          >
          <router-link to="/now-playing" class="nav-link whitespace-nowrap"
            >Now Playing</router-link
          >
          <router-link to="/top-rated" class="nav-link whitespace-nowrap"
            >Top Rated</router-link
          >
        </div>
        <span class="text-black dark:text-gray-400 font-bold hidden lg:inline">|</span>
        <!-- TV Shows Section -->
        <div class="flex items-center gap-x-3">
          <router-link to="/tv" class="nav-link whitespace-nowrap"
            >Popular TV</router-link
          >
          <router-link to="/tv/on-the-air" class="nav-link whitespace-nowrap"
            >On The Air</router-link
          >
          <router-link to="/tv/top-rated" class="nav-link whitespace-nowrap"
            >Top Rated TV</router-link
          >
        </div>
        <span class="text-gray-500 dark:text-gray-400 font-bold hidden lg:inline">|</span>
        <!-- Actions Section -->
        <div class="flex items-center gap-x-2">
          <button 
            @click="toggleSearchDrawer" 
            :class="['nav-link', 'flex', 'items-center', 'whitespace-nowrap', { 'nav-link-active': searchDrawerOpen }]"
          >
            <svg class="w-4 h-4 md:w-5 md:h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span class="hidden lg:inline">Search</span>
          </button>
          <span class="text-gray-500 dark:text-gray-400 font-bold hidden lg:inline">|</span>
          <button
            @click="toggleTheme"
            class="nav-link p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center "
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Sun icon (light mode) - shown when dark mode is active -->
            <svg v-if="isDark" class="w-4 h-4 md:w-5 md:h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <!-- Moon icon (dark mode) - shown when light mode is active -->
            <svg v-else class="w-4 h-4 md:w-5 md:h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="md:hidden">
        <button @click="toggleMenu" class="text-gray-900 dark:text-white">
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
    <div v-if="menuOpen" class="md:hidden mt-4 space-y-1">
      <!-- Movies Section -->
      <div class="pb-2">
        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-1">Movies</p>
        <router-link
          to="/"
          @click="toggleMenu"
          class="nav-link-mobile"
          >Popular Movies</router-link
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
      </div>
      <div class="border-t border-gray-300 dark:border-gray-700 my-2"></div>
      <!-- TV Shows Section -->
      <div class="pb-2">
        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-1">TV Shows</p>
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
      </div>
      <div class="border-t border-gray-300 dark:border-gray-700 my-2"></div>
      <!-- Actions Section -->
      <div class="pb-2">
        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-1">Actions</p>
        <button
          @click="handleMobileSearchClick"
          :class="['nav-link-mobile', 'w-full', 'text-left', 'flex', 'items-center', { 'nav-link-active': searchDrawerOpen }]"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          Search
        </button>
        <button
          @click="toggleTheme"
          class="nav-link-mobile w-full text-left flex items-center"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="isDark" class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <svg v-else class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </div>
    <SearchDrawer />
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../stores/searchStore";
import { useThemeStore } from "../stores/themeStore";
import SearchDrawer from "./SearchDrawer.vue";

const searchStore = useSearchStore();
const themeStore = useThemeStore();
const { searchDrawerOpen, hasActiveFilters } = storeToRefs(searchStore);
const { isDark } = storeToRefs(themeStore);
const { toggleSearchDrawer, clearFilters } = searchStore;
const { toggleTheme } = themeStore;

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
  color: rgb(17 24 39); /* gray-900 */
  text-decoration: none;
  display: inline-block;
  transition: color 0.2s;
}

.dark .nav-link {
  color: white;
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
  color: rgb(17 24 39); /* gray-900 */
  text-decoration: none;
  transition: color 0.2s;
}

.dark .nav-link-mobile {
  color: white;
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
