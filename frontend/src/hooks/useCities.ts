import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { City } from '../types/city';

interface UseCitiesResult {
  cities: City[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useCities(): UseCitiesResult {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      console.debug('[useCities] User not authenticated, skipping fetch');
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      console.debug('[useCities] Fetching cities from API...');
      const token = await getAccessTokenSilently();

      const response = await fetch(`${API_BASE_URL}/api/cities`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.debug('[useCities] API response received with status:', response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to load cities (HTTP ${response.status} ${response.statusText}).`,
        );
      }

      const data: City[] = await response.json();
      console.debug('[useCities] Successfully loaded cities:', data.length, 'cities');
      setCities(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.debug('[useCities] Fetch request was aborted');
        return;
      }
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unexpected error occurred while loading cities.';
      console.error('[useCities] Error loading cities:', errorMessage);
      setError(errorMessage);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    load();
    return () => controllerRef.current?.abort();
  }, [load, isAuthenticated]);

  return { cities, loading, error, refresh: load };
}
