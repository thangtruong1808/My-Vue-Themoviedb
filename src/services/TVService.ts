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

export const getPopularTVShows = async (page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/popular?page=${page}`,
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

export const searchTVShows = async (query: string, page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`,
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

export const getTVShow = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/${id}`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getOnTheAirTVShows = async (page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/on_the_air?page=${page}`,
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

export const getTopRatedTVShows = async (page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/top_rated?page=${page}`,
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

export const getAiringTodayTVShows = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/airing_today`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getTVShowGenres = async () => {
  const response = await fetchWithTimeout(
    `${API_URL}/genre/tv/list`,
    options
  );
  const data = await handleResponse(response);
  return data.genres || [];
};

export const getTVShowCredits = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/${id}/credits`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getTVShowImages = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/${id}/images`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getTVShowVideos = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/${id}/videos`,
    options
  );
  const data = await handleResponse(response);
  return data.results || [];
};

export const getTrendingTVShows = async (timeWindow: string = "day") => {
  const response = await fetchWithTimeout(
    `${API_URL}/trending/tv/${timeWindow}`,
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

export const getTVShowRecommendations = async (id: string, page: number = 1) => {
  const response = await fetchWithTimeout(
    `${API_URL}/tv/${id}/recommendations?page=${page}`,
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

export type DiscoverTVFilters = {
  query?: string;
  genres?: number[];
  first_air_date_year?: number;
  vote_average_gte?: number;
  language?: string;
  runtime_min?: number;
  runtime_max?: number;
  first_air_date_from?: string;
  first_air_date_to?: string;
  page?: number;
};

export const discoverTVShows = async (filters: DiscoverTVFilters) => {
  const params = new URLSearchParams();
  
  if (filters.query) {
    params.append("query", filters.query);
  }
  
  if (filters.genres && filters.genres.length > 0) {
    params.append("with_genres", filters.genres.join(","));
  }
  
  if (filters.first_air_date_year) {
    params.append("first_air_date_year", filters.first_air_date_year.toString());
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
  
  if (filters.first_air_date_from) {
    params.append("first_air_date.gte", filters.first_air_date_from);
  }
  
  if (filters.first_air_date_to) {
    params.append("first_air_date.lte", filters.first_air_date_to);
  }
  
  if (filters.page) {
    params.append("page", filters.page.toString());
  } else {
    params.append("page", "1");
  }
  
  const response = await fetchWithTimeout(
    `${API_URL}/discover/tv?${params.toString()}`,
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

