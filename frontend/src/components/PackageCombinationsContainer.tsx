import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { PackageCombination, Package } from "../types/components";
import { streamingApi } from "../api/streaming";
import PackageCombinationCard from "./PackageCombinationCard";

interface PackageCombinationsContainerProps {
  selectedTeams: string[];
  excludeFullCoveragePackages: Package[];
}

export const PackageCombinationsContainer: React.FC<
  PackageCombinationsContainerProps
> = ({ selectedTeams, excludeFullCoveragePackages }) => {
  const [combinations, setCombinations] = useState<PackageCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCombinations = async () => {
      if (selectedTeams.length === 0) {
        setCombinations([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await streamingApi.getPackageCombinations(
          selectedTeams,
          excludeFullCoveragePackages
        );

        if (data.length === 0) {
          try {
            const backupData = await streamingApi.getPackageCombinationsBackup(
              selectedTeams,
              excludeFullCoveragePackages
            );
            setCombinations(backupData);
          } catch (backupErr) {
            console.error(
              "Error loading backup package combinations:",
              backupErr
            );
            setCombinations([]);
          }
        } else {
          setCombinations(data);
        }
      } catch (err) {
        console.error("Error loading package combinations:", err);
        setError("Failed to load package combinations");
      } finally {
        setLoading(false);
      }
    };

    fetchCombinations();
  }, [selectedTeams, excludeFullCoveragePackages]);

  if (!selectedTeams.length) {
    return null;
  }

  if (loading) {
    return <div>Loading combinations...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (combinations.length > 0) {
    return (
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "primary.main",
            borderBottom: "2px solid",
            borderColor: "primary.light",
            pb: 1,
          }}
        >
          Alternative Package Combinations
        </Typography>
        <Grid container spacing={3}>
          {combinations.map((combination, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <PackageCombinationCard combination={combination} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return null;
};
