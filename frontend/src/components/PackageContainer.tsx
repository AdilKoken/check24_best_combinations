import React, { useEffect, useState } from "react";
import { Package } from "../types/components";
import { streamingApi } from "../api";
import { PackageCards } from "./PackageCards";
import { PriceType } from "../types/components";

interface PackageContainerProps {
  priceType: PriceType;
  priceRange: number[] | null;
  selectedTeams: string[];
}

export const PackageContainer: React.FC<PackageContainerProps> = ({
  selectedTeams,
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        // Add console.log for debugging
        console.log("Fetching packages with teams:", selectedTeams);

        const data =
          selectedTeams?.length > 0
            ? await streamingApi.getPackagesByTeams(selectedTeams)
            : await streamingApi.getAllPackages();
        const all_packages = await streamingApi.getAllPackages();
        console.log("all packages:", all_packages);

        console.log("Received packages:", data);
        setPackages(data);
      } catch (err) {
        console.error("Error loading packages:", err);
        setError("Failed to load packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [selectedTeams]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Add console.log for debugging
  console.log("Rendering packages:", packages);

  return packages.length > 0 ? (
    <PackageCards packages={packages} />
  ) : (
    <div>No packages found</div>
  );
};
