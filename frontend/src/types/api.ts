import { StreamingPackage } from './data';

export interface TeamSearchResponse {
   teams: string[];  // Unique list of teams from both home and away
 }
 
 export interface PackageCoverage {
   package: StreamingPackage;
   coverage: {
     total_matches: number;
     live_matches: number;
     highlights_only: number;
     coverage_percentage: number;
   };
 }
 
 export interface PackageCombination {
   packages: StreamingPackage[];
   total_monthly_cost: number;
   total_yearly_cost: number;
   coverage: {
     total_matches: number;
     live_matches: number;
     highlights_only: number;
     coverage_percentage: number;
   };
 }