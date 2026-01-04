import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Search from "../views/Search.vue";
import MovieDetails from "../views/MovieDetails.vue";
import NowPlaying from "../views/NowPlaying.vue";
import TopRated from "../views/TopRated.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
  },
  {
    path: "/movie/:id",
    name: "MovieDetails",
    component: MovieDetails,
    props: true,
  },
  {
    path: "/now-playing",
    name: "NowPlaying",
    component: NowPlaying,
  },
  {
    path: "/top-rated",
    name: "TopRated",
    component: TopRated,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
