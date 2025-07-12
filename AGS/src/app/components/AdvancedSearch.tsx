'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, MapPin, Tag, SortAsc, SortDesc } from 'lucide-react';

// Types for search functionality
interface SearchFilters {
  query?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string[];
  location?: string;
  tags?: string[];
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface SearchResult<T = any> {
  id: string;
  title: string;
  description?: string;
  category: string;
  location?: string;
  tags: string[];
  status?: string;
  createdAt: string;
  updatedAt?: string;
  relevanceScore?: number;
  data: T;
}

interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  total: number;
  facets: {
    categories: { [key: string]: number };
    locations: { [key: string]: number };
    tags: { [key: string]: number };
    statuses: { [key: string]: number };
  };
  suggestions: string[];
}

interface AdvancedSearchProps<T = any> {
  placeholder?: string;
  categories?: { value: string; label: string }[];
  statuses?: { value: string; label: string }[];
  sortOptions?: { value: string; label: string }[];
  onSearch: (filters: SearchFilters) => Promise<SearchResponse<T>>;
  onResultSelect?: (result: SearchResult<T>) => void;
  showFilters?: boolean;
  showFacets?: boolean;
  className?: string;
}

export function AdvancedSearch<T = any>({
  placeholder = "Search...",
  categories = [],
  statuses = [],
  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
  ],
  onSearch,
  onResultSelect,
  showFilters = true,
  showFacets = true,
  className = '',
}: AdvancedSearchProps<T>) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const [facets, setFacets] = useState<SearchResponse<T>['facets']>({
    categories: {},
    locations: {},
    tags: {},
    statuses: {},
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [total, setTotal] = useState(0);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      setIsLoading(true);
      try {
        const response = await onSearch(searchFilters);
        setResults(response.results);
        setFacets(response.facets);
        setSuggestions(response.suggestions);
        setTotal(response.total);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [onSearch]
  );

  // Trigger search when filters change
  useEffect(() => {
    const searchFilters: SearchFilters = {
      ...filters,
      query: query.trim() || undefined,
    };

    if (query.trim() || Object.keys(filters).length > 0) {
      debouncedSearch(searchFilters);
    } else {
      setResults([]);
      setShowResults(false);
      setTotal(0);
    }
  }, [query, filters, debouncedSearch]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return query.trim() || Object.keys(filters).length > 0;
  }, [query, filters]);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`p-1 rounded hover:bg-gray-100 ${
                showFiltersPanel || Object.keys(filters).length > 0
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="p-1 rounded hover:bg-gray-100 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            return (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                <span className="ml-1">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
                <button
                  onClick={() => removeFilter(key as keyof SearchFilters)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value,
                  })}
                  className="block w-full text-sm border-gray-300 rounded-md"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value,
                  })}
                  className="block w-full text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <select
                  multiple
                  value={filters.category || []}
                  onChange={(e) => updateFilter('category', 
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="block w-full text-sm border-gray-300 rounded-md"
                  size={4}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            {statuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => updateFilter('status', 
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="block w-full text-sm border-gray-300 rounded-md"
                  size={4}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="space-y-2">
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="block w-full text-sm border-gray-300 rounded-md"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="block w-full text-sm border-gray-300 rounded-md"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                placeholder="Enter location..."
                className="block w-full text-sm border-gray-300 rounded-md"
              />
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={filters.tags?.join(', ') || ''}
                onChange={(e) => updateFilter('tags', 
                  e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                )}
                placeholder="Enter tags (comma-separated)..."
                className="block w-full text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {total} result{total !== 1 ? 's' : ''} found
                </span>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => onResultSelect?.(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {result.category}
                          </span>
                          {result.location && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {result.location}
                            </span>
                          )}
                          <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {result.relevanceScore && (
                        <div className="text-xs text-gray-400 ml-2">
                          {Math.round(result.relevanceScore * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No results found</p>
              {suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Did you mean:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Facets Panel */}
      {showFacets && showResults && Object.values(facets).some(facet => Object.keys(facet).length > 0) && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(facets).map(([facetName, facetValues]) => {
            if (Object.keys(facetValues).length === 0) return null;
            
            return (
              <div key={facetName} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                  {facetName.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="space-y-1">
                  {Object.entries(facetValues).slice(0, 5).map(([value, count]) => (
                    <button
                      key={value}
                      onClick={() => {
                        const filterKey = facetName.slice(0, -1) as keyof SearchFilters; // Remove 's' from end
                        const currentValues = filters[filterKey] as string[] || [];
                        const newValues = currentValues.includes(value)
                          ? currentValues.filter(v => v !== value)
                          : [...currentValues, value];
                        updateFilter(filterKey, newValues);
                      }}
                      className="flex items-center justify-between w-full text-left hover:bg-white rounded px-2 py-1"
                    >
                      <span className="truncate">{value}</span>
                      <span className="text-gray-500 ml-2">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 