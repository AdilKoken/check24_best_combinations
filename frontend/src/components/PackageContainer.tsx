import React, { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { Package, PackageWithCoverage, PriceType } from "../types/components";
import { streamingApi } from "../api/streaming";
import PackageCards from "./PackageCards";

interface PackageContainerProps {
  selectedTeams: string[];
  priceType: PriceType;
  priceRange: number[] | null;
  onFullCoveragePackagesChange: (packages: Package[]) => void;
}

const PackageContainer: React.FC<PackageContainerProps> = ({
  selectedTeams,
  priceType,
  priceRange,
  onFullCoveragePackagesChange,
}) => {
  const [packages, setPackages] = useState<Package[] | PackageWithCoverage[]>(
    []
  );
  const [useSoftCoverage, setUseSoftCoverage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter packages based on price type and range
  const filterPackages = (pkgs: Package[] | PackageWithCoverage[]) => {
    let filteredPkgs = pkgs;

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange;
      filteredPkgs = filteredPkgs.filter((pkg) => {
        const pkgData = "package" in pkg ? pkg.package : pkg;
        const monthlyPrice = pkgData.monthly_price_cents;
        const yearlyPrice = pkgData.monthly_price_yearly_subscription_in_cents;

        if (priceType === "monthly" && monthlyPrice !== null) {
          return monthlyPrice >= minPrice && monthlyPrice <= maxPrice;
        }
        if (priceType === "yearly" && yearlyPrice !== null) {
          return yearlyPrice >= minPrice && yearlyPrice <= maxPrice;
        }
        if (priceType === "all") {
          const validMonthly =
            monthlyPrice !== null &&
            monthlyPrice >= minPrice &&
            monthlyPrice <= maxPrice;
          const validYearly =
            yearlyPrice !== null &&
            yearlyPrice >= minPrice &&
            yearlyPrice <= maxPrice;
          return validMonthly || validYearly;
        }
        return false;
      });
    }

    return filteredPkgs;
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = selectedTeams.length
          ? await streamingApi.getPackagesByTeams(
              selectedTeams,
              useSoftCoverage
            )
          : await streamingApi.getAllPackages();

        // Filter based on coverage if using soft coverage
        const coverageFiltered = useSoftCoverage
          ? (data as PackageWithCoverage[]).filter((item) => item.coverage > 0)
          : data;

        // Apply price filters
        const filteredData = filterPackages(coverageFiltered);

        setPackages(filteredData);

        // Update full coverage packages for combinations
        const fullCoverage = useSoftCoverage
          ? (filteredData as PackageWithCoverage[])
              .filter((item) => item.coverage === 1)
              .map((item) => item.package)
          : [];

        onFullCoveragePackagesChange(fullCoverage);
      } catch (err) {
        console.error("Error loading packages:", err);
        setError("Failed to load packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [selectedTeams, useSoftCoverage, priceType, priceRange]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box>
      {selectedTeams.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useSoftCoverage}
                onChange={(e) => setUseSoftCoverage(e.target.checked)}
                color="primary"
              />
            }
            label="Show Partial Coverage"
          />
        </Box>
      )}

      {packages.length > 0 ? (
        <PackageCards packages={packages} useSoftCoverage={useSoftCoverage} />
      ) : (
        <div>No packages found matching the current filters</div>
      )}
    </Box>
  );
};

export default PackageContainer;
