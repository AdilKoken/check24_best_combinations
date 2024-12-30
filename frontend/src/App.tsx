import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Slider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import PackageContainer from "./components/PackageContainer";
import { PackageCombinationsContainer } from "./components/PackageCombinationsContainer";
import { PriceType, Package } from "./types/components";
import TeamSelector from "./components/TeamSelector";

export const App: React.FC = () => {
  // State to manage filter criteria
  const [priceType, setPriceType] = useState<PriceType>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]); // Price in cents (0€ to 50€)
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [fullCoveragePackages, setFullCoveragePackages] = useState<Package[]>(
    []
  );

  const handleTeamsChange = (teams: string[]) => {
    setSelectedTeams(teams);
    setIsFilterApplied(false);
  };

  // Handler for price range changes
  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  // Handler for price type selection
  const handlePriceTypeChange = (newType: PriceType) => {
    setPriceType(newType);
    setIsFilterApplied(false);
  };

  // Handler for toggling filter
  const toggleFilter = () => {
    setIsFilterApplied(!isFilterApplied);
  };

  // Determine active price range based on filter state
  const activePriceRange = isFilterApplied ? priceRange : null;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            background: "linear-gradient(45deg, #1976d2, #2196f3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Streaming Package Comparison
        </Typography>

        <Grid container spacing={4}>
          {/* Filter Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background:
                  "linear-gradient(to bottom right, #ffffff, #fafafa)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: "primary.main",
                  borderBottom: "2px solid",
                  borderColor: "primary.light",
                  pb: 1,
                }}
              >
                Filters
              </Typography>

              <TeamSelector
                selectedTeams={selectedTeams}
                onTeamsChange={handleTeamsChange}
              />

              {/* Price Type Selection */}
              <List
                component="nav"
                sx={{
                  mb: 3,
                  "& .MuiListItemButton-root": {
                    borderRadius: 1,
                    mb: 1,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                  },
                }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    selected={priceType === "all"}
                    onClick={() => handlePriceTypeChange("all")}
                  >
                    <ListItemText primary="All Packages" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={priceType === "monthly"}
                    onClick={() => handlePriceTypeChange("monthly")}
                  >
                    <ListItemText primary="Monthly Subscription" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={priceType === "yearly"}
                    onClick={() => handlePriceTypeChange("yearly")}
                  >
                    <ListItemText primary="Yearly Subscription" />
                  </ListItemButton>
                </ListItem>
              </List>

              {/* Price Range Slider - Always visible */}
              <Box sx={{ px: 2, pb: 3 }}>
                <Typography
                  gutterBottom
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                  }}
                >
                  Price Range (€)
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={5000}
                  step={100}
                  valueLabelFormat={(value) => `${(value / 100).toFixed(2)}€`}
                  sx={{
                    "& .MuiSlider-thumb": {
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.16)",
                      },
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 1,
                    textAlign: "center",
                  }}
                >
                  {(priceRange[0] / 100).toFixed(2)}€ -{" "}
                  {(priceRange[1] / 100).toFixed(2)}€
                </Typography>
              </Box>

              {/* Apply/Clear Filter Button */}
              <Button
                variant={isFilterApplied ? "outlined" : "contained"}
                color={isFilterApplied ? "secondary" : "primary"}
                onClick={toggleFilter}
                fullWidth
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: isFilterApplied ? "none" : 2,
                  "&:hover": {
                    boxShadow: isFilterApplied ? "none" : 4,
                  },
                }}
              >
                {isFilterApplied ? "Clear Filter" : "Apply Filter"}
              </Button>
            </Paper>
          </Grid>

          {/* Packages Display */}
          <Grid item xs={12} md={9}>
            <PackageContainer
              selectedTeams={selectedTeams}
              priceType={priceType}
              priceRange={activePriceRange}
              onFullCoveragePackagesChange={setFullCoveragePackages}
            />

            <PackageCombinationsContainer
              selectedTeams={selectedTeams}
              excludeFullCoveragePackages={fullCoveragePackages}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default App;
