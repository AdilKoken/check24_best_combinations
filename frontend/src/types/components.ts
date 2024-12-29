import { StreamingPackage } from './data';
import { PackageCoverage, PackageCombination } from './api';

export interface TeamSelectorProps {
   onTeamsChange: (teams: string[]) => void;
   disabled?: boolean;
 }
 
 export interface PackageComparisonProps {
   packages: PackageCoverage[];
   loading?: boolean;
 }
 
 export interface PackageCombinationProps {
   combinations: PackageCombination[];
   loading?: boolean;
 }
 
 export interface MatchScheduleProps {
   selectedTeams: string[];
   packages: StreamingPackage[];
   loading?: boolean;
 }