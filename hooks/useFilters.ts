'use client';

import { useState, useMemo } from 'react';

interface UseFiltersOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFunctions?: {
    [key: string]: (item: T, value: string) => boolean;
  };
  sortFunctions?: {
    [key: string]: (a: T, b: T) => number;
  };
}

interface UseFiltersReturn<T> {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: { [key: string]: string };
  setFilter: (key: string, value: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  clearFilters: () => void;
}

export function useFilters<T>({
  data,
  searchFields,
  filterFunctions = {},
  sortFunctions = {}
}: UseFiltersOptions<T>): UseFiltersReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortBy, setSortBy] = useState('');

  const setFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortBy('');
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // 検索フィルター
    if (searchTerm) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && 
            String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // カスタムフィルター
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && filterFunctions[key]) {
        result = result.filter(item => filterFunctions[key](item, value));
      }
    });

    // ソート
    if (sortBy && sortFunctions[sortBy]) {
      result.sort(sortFunctions[sortBy]);
    }

    return result;
  }, [data, searchTerm, filters, sortBy, searchFields, filterFunctions, sortFunctions]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    sortBy,
    setSortBy,
    clearFilters
  };
}
