/**
 * Type definition for a streaming package.
 */
export interface Package {
   id: number;
   name: string;
   monthly_price: number | null;
   yearly_price_monthly: number | null;
   coverage_percentage: number | null;
   live_matches: number;
   highlights_matches: number;
 }
 
 /**
  * Props for the PackageList component.
  */
 export interface PackageListProps {
   packages: Package[];
   selectedPackages: number[];
   onPackageSelect: (id: number) => void;
 }