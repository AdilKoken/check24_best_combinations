import { useState, useCallback } from 'react';
import { FilterOptions } from '../components/FilterSection/types';

const DEFAULT_FILTERS: FilterOptions = {
  minPrice: 0,
  maxPrice: 1000,
  requireLive: false,
  requireHighlights: false,
  minCoverage: 0,
  selectedTeams: []
};

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters((prev: FilterOptions) => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters
  };
};