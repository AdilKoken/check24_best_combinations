import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package } from '../components/PackageList/types';
import { FilterOptions } from '../components/FilterSection/types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface PackageResponse {
  total_games: number;
  packages: Package[];
}

export const usePackages = (filters: FilterOptions) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      if (!filters.selectedTeams.length) {
        setPackages([]);
        setTotalGames(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post<PackageResponse>(`${API_URL}/compare-packages/`, {
          teams: filters.selectedTeams
        });

        // Filter packages based on criteria
        let filteredPackages = response.data.packages.filter((pkg: Package) => {
          const monthlyPrice = pkg.yearly_price_monthly || pkg.monthly_price || 0;
          const meetsPrice = monthlyPrice >= filters.minPrice && monthlyPrice <= filters.maxPrice;
          const meetsCoverage = (pkg.coverage_percentage ?? 0) >= filters.minCoverage;
          const meetsLive = !filters.requireLive || pkg.live_matches > 0;
          const meetsHighlights = !filters.requireHighlights || pkg.highlights_matches > 0;

          return meetsPrice && meetsCoverage && meetsLive && meetsHighlights;
        });

        setPackages(filteredPackages);
        setTotalGames(response.data.total_games);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [filters]);

  return { packages, totalGames, loading, error };
};