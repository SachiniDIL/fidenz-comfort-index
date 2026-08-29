import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export interface ForecastPoint {
  dateTime: string;
  temperature: number;
}

interface UseForecastResult {
  data: ForecastPoint[];
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Lazily fetches the 5-day / 3-hour forecast for a city.
 *
 * Pass `null` to stay idle (nothing is fetched until a real cityCode arrives).
 * Mirrors the token-attachment and abort-controller patterns in useCities.ts.
 * The owning component keeps this hook mounted after the first expand, so its
 * `data` survives a collapse and re-expanding never refetches.
 */
export function useForecast(cityCode: string | null): UseForecastResult {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const loadedCodeRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!cityCode || !isAuthenticated) return;
    if (loadedCodeRef.current === cityCode) return; // already have this city

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${API_BASE_URL}/api/cities/${encodeURIComponent(cityCode)}/forecast`,
        {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load forecast (HTTP ${response.status} ${response.statusText}).`,
        );
      }

      const points: ForecastPoint[] = await response.json();
      loadedCodeRef.current = cityCode;
      setData(points);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while loading the forecast.',
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [cityCode, getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    if (!cityCode) return;
    load();
    return () => controllerRef.current?.abort();
  }, [cityCode, load]);

  return { data, loading, error };
}
