// PackageCards.tsx
import React from "react";
import { Grid } from "@mui/material";
import { PackageCardsProps } from "../types/components";
import PackageCard from "./PackageCard";

const PackageCards: React.FC<PackageCardsProps> = ({ packages }) => {
  return (
    <Grid container spacing={3}>
      {packages.map((pkg) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.id}>
          <PackageCard pkg={pkg} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PackageCards;
