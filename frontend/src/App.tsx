import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { TeamSelector } from "./components/TeamSelector";
import { PackageComparisonTable } from "./components/PackageComparison";
import { PackageCombinationList } from "./components/PackageCombination";
import { streamingApi } from "./api";
import type { PackageComparison, PackageCombination } from "./types/data";

interface ErrorState {
  open: boolean;
  message: string;
}

export const App: React.FC = () => {
  // State management
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PackageComparison[]>([]);
  const [combinations, setCombinations] = useState<PackageCombination[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<ErrorState>({ open: false, message: "" });

  // Error handling
  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  const handleCloseError = () => {
    setError({ ...error, open: false });
  };

  // Data fetching
  const handleTeamsChange = async (teams: string[]) => {
    setSelectedTeams(teams);

    if (teams.length === 0) {
      setPackages([]);
      setCombinations([]);
      return;
    }

    setLoading(true);
    try {
      const [packagesData, combinationsData] = await Promise.all([
        streamingApi.comparePackages(teams),
        streamingApi.findBestCombinations(teams),
      ]);

      setPackages(packagesData);
      setCombinations(combinationsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      handleError("Failed to fetch package data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Content sections
  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (selectedTeams.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            Select teams to see available streaming packages
          </Typography>
        </Box>
      );
    }

    return (
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          centered
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={`Package Comparison (${packages.length})`}
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            label={`Best Combinations (${combinations.length})`}
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <PackageComparisonTable packages={packages} loading={loading} />
          )}
          {activeTab === 1 && (
            <PackageCombinationList
              combinations={combinations}
              loading={loading}
            />
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Streaming Package Comparison
        </Typography>

        {/* Team Selection */}
        <Box sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
          <TeamSelector onTeamsChange={handleTeamsChange} disabled={loading} />
          {selectedTeams.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}
            >
              Showing results for {selectedTeams.length} selected team(s)
            </Typography>
          )}
        </Box>

        {/* Main Content */}
        {renderContent()}

        {/* Error Snackbar */}
        <Snackbar
          open={error.open}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseError} severity="error" variant="filled">
            {error.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};
