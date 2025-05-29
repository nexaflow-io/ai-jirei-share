'use client';

import { useState, useEffect } from 'react';

interface UsePageDataOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  initialData?: T | null;
}

interface UsePageDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePageData<T>({
  fetchFn,
  dependencies = [],
  initialData = null
}: UsePageDataOptions<T>): UsePageDataReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
