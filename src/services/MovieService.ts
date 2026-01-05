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

export const getPopularMovies = async (page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/popular?page=${page}`,
    options
  );
  const data = await handleResponse(response);
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  };
};

export const searchMovies = async (query: string, page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
    options
  );
  const data = await handleResponse(response);
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  };
};

export const discoverMovies = async (filters: {
  query?: string;
  genres?: number[];
  year?: number;
  vote_average_gte?: number;
  language?: string;
  runtime_min?: number;
  runtime_max?: number;
  release_date_from?: string;
  release_date_to?: string;
  page?: number;
}) => {
  const params = new URLSearchParams();
  
  if (filters.query) {
    // If query is provided, use search endpoint instead of discover
    return searchMovies(filters.query, filters.page || 1);
  }
  
  if (filters.genres && filters.genres.length > 0) {
    params.append("with_genres", filters.genres.join(","));
  }
  
  if (filters.year) {
    params.append("primary_release_year", filters.year.toString());
  }
  
  if (filters.vote_average_gte !== undefined) {
    params.append("vote_average.gte", filters.vote_average_gte.toString());
  }
  
  if (filters.language) {
    params.append("with_original_language", filters.language);
  }
  
  if (filters.runtime_min !== undefined) {
    params.append("with_runtime.gte", filters.runtime_min.toString());
  }
  
  if (filters.runtime_max !== undefined) {
    params.append("with_runtime.lte", filters.runtime_max.toString());
  }
  
  if (filters.release_date_from) {
    params.append("primary_release_date.gte", filters.release_date_from);
  }
  
  if (filters.release_date_to) {
    params.append("primary_release_date.lte", filters.release_date_to);
  }
  
  if (filters.page) {
    params.append("page", filters.page.toString());
  } else {
    params.append("page", "1");
  }
  
  const response = await fetchWithTimeout(
    `${API_URL}/discover/movie?${params.toString()}`,
    options
  );
  const data = await handleResponse(response);
  return {
    results: data.results || [],
    page: data.page || filters.page || 1,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  };
};

export const getMovie = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/${id}`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getNowPlayingMovies = async (page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/now_playing?page=${page}`,
    options
  );
  const data = await handleResponse(response);
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  };
};

export const getTopRatedMovies = async (page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/top_rated?page=${page}`,
    options
  );
  const data = await handleResponse(response);
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  };
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

export const getMovieRecommendations = async (id: string, page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/movie/${id}/recommendations?page=${page}`,
    options
  );
  const data = await handleResponse(response);
  return {
    results: data.results || [],
    page: data.page || page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  };
};

export const getConfiguration = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/configuration`,
    options
  );
  const data = await handleResponse(response);
  return data;
};
