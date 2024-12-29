// src/types/data.ts

// Base types matching our CSV data structure
export interface Game {
   id: number;
   team_home: string;
   team_away: string;
   starts_at: string;
   tournament_name: string;
}

export interface StreamingPackage {
   id: number;
   name: string;
   monthly_price_cents: number;
   monthly_price_yearly_subscription_in_cents: number;
}

export interface StreamingOffer {
   game_id: number;
   streaming_package_id: number;
   live: number;  // 0 or 1
   highlights: number;  // 0 or 1
}

// Coverage information for a package
export interface PackageCoverage {
   total_matches: number;
   live_matches: number;
   highlights_only: number;
   coverage_percentage: number;
}

// Package comparison with coverage information
export interface PackageComparison {
   package: StreamingPackage;
   coverage: PackageCoverage;
}

// Optimal combination of packages
export interface PackageCombination {
   packages: StreamingPackage[];
   total_monthly_cost: number;
   total_yearly_cost: number;
   coverage: PackageCoverage;
}