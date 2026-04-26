'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/lib/api/types';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(url: string | null): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (url === null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const json: ApiResponse<T> = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? 'Unknown error');
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useApiMultiple<T extends Record<string, unknown>>(
  urls: T,
): {
  data: { [K in keyof T]: T[K] extends string ? (unknown extends T[K] ? null : unknown) : null };
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [results, setResults] = useState<{ [K in keyof T]?: unknown }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const entries = Object.entries(urls) as [string, string | null][];
    const settled = await Promise.allSettled(
      entries.map(async ([key, url]) => {
        if (url === null) return [key, null] as const;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${key}: ${res.status}`);
        const json = await res.json();
        return [key, json.data ?? null] as const;
      }),
    );

    const newResults: Record<string, unknown> = {};
    let firstError: string | null = null;

    settled.forEach((result, i) => {
      const key = entries[i][0];
      if (result.status === 'fulfilled') {
        newResults[key] = result.value[1];
      } else {
        newResults[key] = null;
        if (!firstError) {
          firstError = result.reason instanceof Error ? result.reason.message : 'Failed to fetch';
        }
      }
    });

    setResults(newResults as { [K in keyof T]?: unknown });
    setError(firstError);
    setLoading(false);
  }, [urls]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data: results as { [K in keyof T]: T[K] extends string ? (unknown extends T[K] ? null : unknown) : null },
    loading,
    error,
    refetch: fetchAll,
  };
}
