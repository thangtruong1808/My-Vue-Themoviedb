import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getPerson,
  getPersonImages,
  getPersonCombinedCredits,
} from "../services/PersonService";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

export const usePersonStore = defineStore("person", () => {
  const personDetails = ref<any>(null);
  const personImages = ref<any>(null);
  const personCredits = ref<any>(null);
  const loading = ref(false);
  const error = ref("");

  // Cache storage
  const cache = ref<Map<string, CacheEntry<any>>>(new Map());

  // Request deduplication - track ongoing requests
  const ongoingRequests = ref<Map<string, Promise<any>>>(new Map());

  // Helper function to check if cache is valid
  const isCacheValid = (key: string): boolean => {
    const entry = cache.value.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_DURATION;
  };

  // Helper function to get cached data
  const getCachedData = <T>(key: string): T | null => {
    const entry = cache.value.get(key);
    if (entry && isCacheValid(key)) {
      return entry.data as T;
    }
    return null;
  };

  // Helper function to set cached data
  const setCachedData = <T>(key: string, data: T): void => {
    cache.value.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  // Generic fetch function with caching and deduplication
  const fetchWithCache = async <T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    updateRef: (data: T) => void
  ): Promise<T> => {
    // Check cache first
    const cachedData = getCachedData<T>(cacheKey);
    if (cachedData) {
      updateRef(cachedData);
      loading.value = false;
      return cachedData;
    }

    // Check if request is already in progress
    if (ongoingRequests.value.has(cacheKey)) {
      loading.value = true;
      return ongoingRequests.value.get(cacheKey)!;
    }

    // Make new request
    loading.value = true;
    error.value = "";
    const promise = fetchFn()
      .then((data) => {
        setCachedData(cacheKey, data);
        updateRef(data);
        return data;
      })
      .catch((err) => {
        error.value = err.message || "Failed to fetch data";
        throw err;
      })
      .finally(() => {
        loading.value = false;
        ongoingRequests.value.delete(cacheKey);
      });

    ongoingRequests.value.set(cacheKey, promise);
    return promise;
  };

  const fetchPersonDetails = async (id: string) => {
    const cacheKey = `person:${id}`;
    const cachedData = getCachedData<any>(cacheKey);
    if (!cachedData) {
      loading.value = true;
      personDetails.value = null;
      personImages.value = null;
      personCredits.value = null;
    }
    
    await fetchWithCache(
      cacheKey,
      () => getPerson(id),
      (data) => (personDetails.value = data)
    );

    // Fetch images and credits in parallel
    const imagesCacheKey = `person:${id}:images`;
    const creditsCacheKey = `person:${id}:credits`;

    await fetchWithCache(
      imagesCacheKey,
      () => getPersonImages(id),
      (data) => (personImages.value = data)
    ).catch((err) => {
      console.error("Failed to fetch person images:", err);
    });

    await fetchWithCache(
      creditsCacheKey,
      () => getPersonCombinedCredits(id),
      (data) => (personCredits.value = data)
    ).catch((err) => {
      console.error("Failed to fetch person credits:", err);
    });
  };

  return {
    personDetails,
    personImages,
    personCredits,
    loading,
    error,
    fetchPersonDetails,
  };
});

