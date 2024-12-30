import React, { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { Package, PackageWithCoverage } from "../types/components";
import { streamingApi } from "../api";
import { PackageCards } from "./PackageCards";

interface PackageContainerProps {
  selectedTeams: string[];
}

export const PackageContainer: React.FC<PackageContainerProps> = ({
  selectedTeams,
}) => {
  const [packages, setPackages] = useState<Package[] | PackageWithCoverage[]>(
    []
  );
  const [useSoftCoverage, setUseSoftCoverage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        if (selectedTeams?.length > 0) {
          // Get packages with coverage information
          const data = await streamingApi.getPackagesByTeams(
            selectedTeams,
            useSoftCoverage
          );

          // Filter out packages with 0 coverage when using soft coverage
          const filteredData = useSoftCoverage
            ? (data as PackageWithCoverage[]).filter(
                (item) => item.coverage > 0
              )
            : data;

          setPackages(filteredData);
        } else {
          // Get all packages without coverage
          const data = await streamingApi.getAllPackages();
          setPackages(data);
        }
      } catch (err) {
        console.error("Error loading packages:", err);
        setError("Failed to load packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [selectedTeams, useSoftCoverage]);

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
        <div>No packages found</div>
      )}
    </Box>
  );
};
