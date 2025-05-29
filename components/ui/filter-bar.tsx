'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  activeFilters?: { label: string; value: string; onRemove: () => void }[];
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = '検索...',
  filters = [],
  activeFilters = [],
  className = ''
}: FilterBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* フィルター */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <div key={filter.label} className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{filter.label}:</span>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.count !== undefined && `(${option.count})`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* アクティブフィルター */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center space-x-1 px-2 py-1"
            >
              <span className="text-xs">{filter.label}: {filter.value}</span>
              <button
                onClick={filter.onRemove}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
