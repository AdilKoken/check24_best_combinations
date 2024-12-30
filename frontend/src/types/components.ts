// types/components.ts
export type PriceType = "all" | "monthly" | "yearly";

export interface Package {
    id: number;
    name: string;
    monthly_price_cents: number | null;
    monthly_price_yearly_subscription_in_cents: number | null;
}

export interface PackageWithCoverage {
    package: Package;
    coverage: number;
}

export interface PackageCardProps {
    pkg: Package | PackageWithCoverage;
}

export interface PackageCardsProps {
    packages: (Package | PackageWithCoverage)[];
    useSoftCoverage: boolean;
}

export interface PackageContainerProps {
    selectedTeams: string[];
}