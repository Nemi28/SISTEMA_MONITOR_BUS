import { useState, useEffect, useCallback } from "react";

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 5000,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch {
      setError("Error al obtener datos");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, intervalMs);
    return () => clearInterval(interval);
  }, [fetch, intervalMs]);

  return { data, loading, error, refetch: fetch };
}
