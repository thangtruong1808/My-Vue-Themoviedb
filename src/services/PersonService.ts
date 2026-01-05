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

export const getPerson = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/person/${id}`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getPersonImages = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/person/${id}/images`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

export const getPersonCombinedCredits = async (id: string) => {
  const response = await fetchWithTimeout(
    `${API_URL}/person/${id}/combined_credits`,
    options
  );
  const data = await handleResponse(response);
  return data;
};

