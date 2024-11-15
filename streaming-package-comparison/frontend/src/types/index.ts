// src/types/index.ts

export interface Team {
   id: number;
   name: string;
 }
 
 export interface Package {
   id: number;
   name: string;
   price: number;
   provider: string;
 }
 
 export interface PackageCombination {
   packages: Package[];
   coverage: number;
   totalPrice: number;
 }
 
 export interface ComparisonResult {
   singlePackage?: {
     name: string;
     coverage: number;
     price: number;
   };
   combinations: PackageCombination[];
   coverage: Array<{
     name: string;
     coverage: number;
     price: number;
   }>;
 }
 
 export interface TeamSelectionProps {
   onTeamsSelected: (teams: Team[]) => void;
   selectedTeams: Team[];
 }
 
 export interface PackageComparisonProps {
   selectedTeams: Team[];
 }
 
 export interface LayoutProps {
   children: React.ReactNode;
 }