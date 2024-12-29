import React from "react";
import {
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material";
import type { PackageCombination } from "../../types/data";

interface PackageCombinationProps {
  combinations: PackageCombination[];
  loading?: boolean;
}

const formatPrice = (cents: number): string => {
  return `€${(cents / 100).toFixed(2)}`;
};

export const PackageCombinationList: React.FC<PackageCombinationProps> = ({
  combinations,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        {[1, 2].map((i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (combinations.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography color="text.secondary">
          No package combinations available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Optimal Package Combinations
      </Typography>
      {combinations.map((combination, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Combination {index + 1}
            </Typography>

            <Box sx={{ mb: 2 }}>
              {combination.packages.map((pkg) => (
                <Chip
                  key={pkg.id}
                  label={pkg.name}
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Monthly Cost:</Typography>
              <Typography>
                {formatPrice(combination.total_monthly_cost)}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">
                Yearly Cost (per month):
              </Typography>
              <Typography>
                {formatPrice(combination.total_yearly_cost)}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Coverage:</Typography>
              <Typography>
                {combination.coverage.coverage_percentage.toFixed(1)}%
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Live Matches:</Typography>
              <Typography>
                {combination.coverage.live_matches} of{" "}
                {combination.coverage.total_matches}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
