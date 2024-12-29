import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import type { PackageComparison } from "../../types/data";

interface PackageComparisonTableProps {
  packages: PackageComparison[];
  loading?: boolean;
}

const formatPrice = (cents: number): string => {
  return `€${(cents / 100).toFixed(2)}`;
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const PackageComparisonTable: React.FC<PackageComparisonTableProps> = ({
  packages,
  loading = false,
}) => {
  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Skeleton />
              </TableCell>
              <TableCell align="right">
                <Skeleton />
              </TableCell>
              <TableCell align="right">
                <Skeleton />
              </TableCell>
              <TableCell align="right">
                <Skeleton />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell align="right">
                  <Skeleton />
                </TableCell>
                <TableCell align="right">
                  <Skeleton />
                </TableCell>
                <TableCell align="right">
                  <Skeleton />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (packages.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography color="text.secondary">
          No packages found for the selected teams
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Package</TableCell>
            <TableCell align="right">Monthly Price</TableCell>
            <TableCell align="right">Yearly Price (Monthly)</TableCell>
            <TableCell align="right">Live Matches</TableCell>
            <TableCell align="right">Highlights Only</TableCell>
            <TableCell align="right">Coverage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.package.id}>
              <TableCell component="th" scope="row">
                {pkg.package.name}
              </TableCell>
              <TableCell align="right">
                {formatPrice(pkg.package.monthly_price_cents)}
              </TableCell>
              <TableCell align="right">
                {formatPrice(
                  pkg.package.monthly_price_yearly_subscription_in_cents
                )}
              </TableCell>
              <TableCell align="right">{pkg.coverage.live_matches}</TableCell>
              <TableCell align="right">
                {pkg.coverage.highlights_only}
              </TableCell>
              <TableCell align="right">
                {formatPercentage(pkg.coverage.coverage_percentage)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
