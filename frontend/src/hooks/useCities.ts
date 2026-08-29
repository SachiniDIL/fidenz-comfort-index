import { useCallback, useEffect, useRef, useState } from 'react';
import type { City } from '../types/city';

interface UseCitiesResult {
  cities: City[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useCities(): UseCitiesResult {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/cities`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load cities (HTTP ${response.status} ${response.statusText}).`,
        );
      }

      const data: City[] = await response.json();
      setCities(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while loading cities.',
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { cities, loading, error, refresh: load };
}
