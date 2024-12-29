export type PriceType = "all" | "monthly" | "yearly";

export interface Package {
  id: number;
  name: string;
  monthly_price_cents: number | null;
  monthly_price_yearly_subscription_in_cents: number | null;
}

export interface PackageCardProps {
  pkg: Package;
}

export interface PackageCardsProps {
  packages: Package[];
}

export interface PackageContainerProps {
  priceType: PriceType;
  priceRange: number[] | null;
}