// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "https://api.themoviedb.org/3";
const API_ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN;

// Request timeout: 10 seconds
const REQUEST_TIMEOUT = 10000;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_ACCESS_TOKEN}`,
  },
};

// Helper function to create a fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout: The server took too long to respond");
    }
    throw error;
  }
};

// Helper function to handle API responses with proper error handling
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.status_message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const getPopularMovies = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/popular`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const searchMovies = async (query: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/search/movie?query=${encodeURIComponent(query)}`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getMovie = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/${id}`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getNowPlayingMovies = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/now_playing`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getTopRatedMovies = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/top_rated`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getUpcomingMovies = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/upcoming`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getMovieGenres = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/genre/movie/list`,
    options
  );
  const data = await handleResponse(response);
  return data.genres || [];
};

export const getMovieCredits = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/${id}/credits`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getMovieImages = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/${id}/images`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getMovieVideos = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/${id}/videos`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getTrendingMovies = async (timeWindow: string = "day") => {
  const response = await fetchWithTimeout(
    `${API_URL}/trending/movie/${timeWindow}`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getConfiguration = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/configuration`,
    options
  );
  const data = await handleResponse(response);
  return data;
};
