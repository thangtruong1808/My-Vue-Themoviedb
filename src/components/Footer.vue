<template>
  <footer class="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 bottom-0 left-0 right-0 z-30 w-full sticky">
    <div class="container mx-auto px-4 py-4">
      <!-- Row 1: Copyright and Social Media -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
        <div class="mb-3 md:mb-0">
          <p class="text-black dark:text-gray-400 text-sm text-center md:text-left">
            <!-- &copy; {{ currentYear }} MovieDB. All rights reserved. -->
             MyVue-Themoviedb Version 1.0.0 - Frontend Application 
          </p>
        </div>
        <div class="flex space-x-4">
         
          <!-- Facebook -->
          <a
            href="https://www.facebook.com/profile.php?id=100051753410222"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="Facebook"
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </a>

          <!-- LinkedIn -->
          <a
            href="https://www.linkedin.com/in/thang-truong-00b245200/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="LinkedIn"
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
          </a>

          <!-- GitHub -->
          <a
            href="https://github.com/thangtruong1808"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="GitHub"
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>

           <!-- Blog -->
           <a
            href="https://www.thang-truong.blog/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="Facebook"
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.09a15.4 15.4 0 00-1.2-5.02A8.03 8.03 0 0119.93 11zM12 4c.88 1.28 1.58 3.1 1.9 5H10.1C10.42 7.1 11.12 5.28 12 4zM4.07 13h3.09c.22 1.8.68 3.5 1.2 5.02A8.03 8.03 0 014.07 13zm3.09-2H4.07a8.03 8.03 0 014.22-5.02A15.4 15.4 0 007.16 11zM12 20c-.88-1.28-1.58-3.1-1.9-5h3.8c-.32 1.9-1.02 3.72-1.9 5zm2.74-2.98c.52-1.52.98-3.22 1.2-5.02h3.09a8.03 8.03 0 01-4.29 5.02z"/>
            <!-- <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"/>
            <path d="M5 5h6v2H7v10h10v-4h2v6H5V5z"/> -->
            </svg>
          </a>
        </div>
      </div>

      <!-- Row 2: Developer Info and Libraries -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <!-- Developer Info -->
        <div class="w-full lg:w-auto">
          <p class="text-black dark:text-gray-400 text-xs text-center lg:text-left">
            <span class="text-black dark:text-gray-300 font-medium">Developed by:</span> Thang Truong - thangtruong1808@gmail.com
          </p>
        </div>

        <!-- Libraries Used -->
        <div class="w-full lg:w-auto">
          <p class="text-gray-600 dark:text-gray-400 text-xs text-center lg:text-left mb-2 lg:mb-0">
            <span class="text-gray-700 dark:text-gray-300 font-medium">Built with:</span>
          </p>
          <div class="flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-1 text-xs">
            <span class="text-black dark:text-gray-400">Vue 3</span>
            <span class="text-black dark:text-gray-500">•</span>
            <span class="text-black dark:text-gray-400">Vue Router</span>
            <span class="text-black dark:text-gray-500">•</span>
            <span class="text-black dark:text-gray-400">Pinia</span>
            <span class="text-black dark:text-gray-500">•</span>
            <span class="text-black dark:text-gray-400">TypeScript</span>
            <span class="text-black dark:text-gray-500">•</span>
            <span class="text-black dark:text-gray-400">Tailwind CSS</span>
            <span class="text-black dark:text-gray-500">•</span>
            <span class="text-black dark:text-gray-400">Vite</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>


