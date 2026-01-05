import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<'light' | 'dark'>('dark');
  
  const isDark = computed(() => theme.value === 'dark');
  
  // Apply theme class to document root
  const applyTheme = (newTheme: 'light' | 'dark') => {
    // Use nextTick to ensure DOM is ready
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        // Also ensure body has the class for compatibility
        document.body?.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
      // Force a reflow to ensure styles are applied
      document.documentElement.offsetHeight;
    }
  };
  
  // Set theme and persist to localStorage
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme;
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  // Initialize theme from localStorage or default to dark
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      // Default to dark theme (maintains current behavior)
      setTheme('dark');
    }
  };
  
  // Watch for theme changes and apply to DOM
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  }, { immediate: true });
  
  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    initializeTheme,
  };
});

