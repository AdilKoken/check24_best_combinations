export interface FilterOptions {
   minPrice: number;
   maxPrice: number;
   requireLive: boolean;
   requireHighlights: boolean;
   minCoverage: number;
   selectedTeams: string[];
 }
 
 export interface FilterSectionProps {
   onFilterChange: (filters: FilterOptions) => void;
   availableTeams: string[];
 }