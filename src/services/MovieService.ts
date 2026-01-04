const API_URL = import.meta.env.VITE_API_URL;
const API_ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
};

export const getPopularMovies = async () => {
  const response = await fetch(`${API_URL}/movie/popular`, options);
  const data = await response.json();
  return data.results;
};

export const searchMovies = async (query: string) => {
  const response = await fetch(
    `${API_URL}/search/movie?query=${query}`,
    options
  );
  const data = await response.json();
  return data.results;
};

export const getMovie = async (id: string) => {
  const response = await fetch(`${API_URL}/movie/${id}`, options);
  const data = await response.json();
  return data;
};

export const getNowPlayingMovies = async () => {
  const response = await fetch(`${API_URL}/movie/now_playing`, options);
  const data = await response.json();
  return data.results;
};

export const getTopRatedMovies = async () => {
  const response = await fetch(`${API_URL}/movie/top_rated`, options);
  const data = await response.json();
  return data.results;
};
