import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Search from "../views/Search.vue";
import MovieDetails from "../views/MovieDetails.vue";
import NowPlaying from "../views/NowPlaying.vue";
import TopRated from "../views/TopRated.vue";
import HomeTV from "../views/HomeTV.vue";
import OnTheAir from "../views/OnTheAir.vue";
import TopRatedTV from "../views/TopRatedTV.vue";
import SearchTV from "../views/SearchTV.vue";
import TVDetails from "../views/TVDetails.vue";

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
  {
    path: "/tv",
    name: "HomeTV",
    component: HomeTV,
  },
  {
    path: "/tv/on-the-air",
    name: "OnTheAir",
    component: OnTheAir,
  },
  {
    path: "/tv/top-rated",
    name: "TopRatedTV",
    component: TopRatedTV,
  },
  {
    path: "/tv/search",
    name: "SearchTV",
    component: SearchTV,
  },
  {
    path: "/tv/:id",
    name: "TVDetails",
    component: TVDetails,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
