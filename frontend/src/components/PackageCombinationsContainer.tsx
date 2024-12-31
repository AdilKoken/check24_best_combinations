import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Tabs, Tab } from "@mui/material";
import { PackageCombination, Package } from "../types/components";
import { streamingApi } from "../api/streaming";
import PackageCombinationCard from "./PackageCombinationCard";

interface PackageCombinationsContainerProps {
  selectedTeams: string[];
  excludeFullCoveragePackages: Package[];
}

type CombinationsData = {
  monthly_ordered: PackageCombination[];
  yearly_ordered: PackageCombination[];
};

export const PackageCombinationsContainer: React.FC<
  PackageCombinationsContainerProps
> = ({ selectedTeams, excludeFullCoveragePackages }) => {
  const [combinations, setCombinations] = useState<CombinationsData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchCombinations = async () => {
      if (selectedTeams.length === 0) {
        setCombinations(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await streamingApi.getPackageCombinations(
          selectedTeams,
          excludeFullCoveragePackages
        );

        if (
          !data ||
          (!data.monthly_ordered?.length && !data.yearly_ordered?.length)
        ) {
          try {
            const backupData = await streamingApi.getPackageCombinationsBackup(
              selectedTeams,
              excludeFullCoveragePackages
            );
            setCombinations(
              backupData || { monthly_ordered: [], yearly_ordered: [] }
            );
          } catch (backupErr) {
            console.error(
              "Error loading backup package combinations:",
              backupErr
            );
            setCombinations({ monthly_ordered: [], yearly_ordered: [] });
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

  // Ensure combinations exists and has at least one non-empty list
  const hasMonthlyOptions = combinations?.monthly_ordered?.length > 0;
  const hasYearlyOptions = combinations?.yearly_ordered?.length > 0;

  if (!combinations || (!hasMonthlyOptions && !hasYearlyOptions)) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        Package Combinations
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Best Monthly Price" disabled={!hasMonthlyOptions} />
          <Tab label="Best Yearly Price" disabled={!hasYearlyOptions} />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {activeTab === 0 &&
          combinations.monthly_ordered?.map((combination, index) => (
            <Grid item xs={12} sm={6} md={4} key={`monthly-${index}`}>
              <PackageCombinationCard combination={combination} />
            </Grid>
          ))}
        {activeTab === 1 &&
          combinations.yearly_ordered?.map((combination, index) => (
            <Grid item xs={12} sm={6} md={4} key={`yearly-${index}`}>
              <PackageCombinationCard combination={combination} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};
