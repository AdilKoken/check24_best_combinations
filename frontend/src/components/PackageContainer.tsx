// PackageContainer.tsx
import React, { useState, useEffect } from "react";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import { streamingApi } from "../api";
import PackageCards from "./PackageCards";
import { Package, PackageContainerProps } from "../types/components";

const PackageContainer: React.FC<PackageContainerProps> = ({
  priceType,
  priceRange,
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await streamingApi.getAllPackages();
        setPackages(data);
      } catch (err) {
        console.error("Error loading packages:", err);
        setError("Failed to load streaming packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    if (priceType === "all") {
      return true;
    }

    if (priceType === "monthly") {
      if (pkg.monthly_price_cents === null) {
        return false;
      }
      if (priceRange) {
        return (
          pkg.monthly_price_cents >= priceRange[0] &&
          pkg.monthly_price_cents <= priceRange[1]
        );
      }
      return true;
    }

    if (priceType === "yearly") {
      if (pkg.monthly_price_yearly_subscription_in_cents === null) {
        return false;
      }
      if (priceRange) {
        return (
          pkg.monthly_price_yearly_subscription_in_cents >= priceRange[0] &&
          pkg.monthly_price_yearly_subscription_in_cents <= priceRange[1]
        );
      }
      return true;
    }

    return true;
  });

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" className="text-center">
        {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" className="mb-8 text-center">
        Available Streaming Packages
      </Typography>
      <PackageCards packages={filteredPackages} />
    </Container>
  );
};

export default PackageContainer;
