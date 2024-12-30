// PackageCards.tsx
import React from "react";
import { Grid } from "@mui/material";
import PackageCard from "./PackageCard";

interface PackageCardsProps {
  packages: any[]; // Using any[] temporarily to handle both package types
  useSoftCoverage?: boolean;
}

export const PackageCards: React.FC<PackageCardsProps> = ({ packages }) => {
  return (
    <Grid container spacing={3}>
      {packages.map((pkg) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.id || pkg.package.id}>
          <PackageCard pkg={pkg} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PackageCards;
