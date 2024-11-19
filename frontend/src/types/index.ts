// Team selector types
export interface TeamSelectorProps {
   teams: string[];
   selectedTeams: string[];
   onTeamsChange: (teams: string[]) => void;
   isLoading?: boolean;
   error?: string | null;
 }
 
 // Filter types
 export interface FilterSectionProps {
   onFilterChange: (filters: Partial<FilterOptions>) => void;
   teams: string[];
 }
 
 export interface FilterOptions {
   selectedTeams: string[];
   minPrice: number;
   maxPrice: number;
   requireLive: boolean;
   requireHighlights: boolean;
   minCoverage: number;
 }
 
 // Package types
 export interface Package {
   id: number;
   name: string;
   monthly_price: number | null;
   yearly_price_monthly: number | null;
   total_matches: number;
   live_matches: number;
   highlights_matches: number;
   coverage_percentage: number;
 }
 
 export interface PackageListProps {
   packages: Package[];
   selectedPackages: number[];
   onPackageSelect: (packageId: number) => void;
 }
 
 export interface ComparisonTableProps {
   packages: Package[];
   selectedPackages: number[];
   totalGames: number;
 }