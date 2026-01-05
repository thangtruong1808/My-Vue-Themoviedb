import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import "./style.css";
import App from "./App.vue";

// Initialize Pinia first
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);

// Initialize theme BEFORE mounting to ensure dark class is applied early
import { useThemeStore } from "./stores/themeStore";
const themeStore = useThemeStore();

// Apply theme immediately before mount
if (typeof document !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

themeStore.initializeTheme();
app.mount("#app");
