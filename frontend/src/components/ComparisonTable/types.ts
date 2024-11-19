import { Package } from '../PackageList/types';

export interface ComparisonTableProps {
  packages: Package[];
  totalGames: number;
  selectedPackages: number[];
}

export interface ComparisonMetrics {
  totalCoverage: number;
  totalCost: number;
  liveCoverage: number;
  highlightsCoverage: number;
}