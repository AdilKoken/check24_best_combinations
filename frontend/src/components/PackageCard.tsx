import React from "react";
import { Card, CardContent, Typography, Box, Paper, Chip } from "@mui/material";
import {
  PackageCardProps,
  Package,
  PackageWithCoverage,
} from "../types/components";
import { formatPrice } from "../utils";

const isPackageWithCoverage = (pkg: any): pkg is PackageWithCoverage => {
  return "coverage" in pkg && "package" in pkg;
};

export const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  const packageData = isPackageWithCoverage(pkg) ? pkg.package : pkg;
  const coverage = isPackageWithCoverage(pkg) ? pkg.coverage : undefined;

  const getCoverageColor = (value: number) => {
    if (value >= 0.9) return "success";
    if (value >= 0.7) return "warning";
    return "error";
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "all 0.3s ease-in-out",
        ":hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
        },
        background: "linear-gradient(to bottom right, #ffffff, #fafafa)",
        position: "relative",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ height: "100%", p: 3 }}>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            borderBottom: "2px solid",
            borderColor: "primary.light",
            pb: 1,
            mb: 2,
          }}
        >
          {packageData.name}
        </Typography>

        {/* Coverage Badge */}
        {coverage !== undefined && (
          <Box sx={{ mb: 3 }}>
            <Chip
              label={`${(coverage * 100).toFixed(1)}% Coverage`}
              color={getCoverageColor(coverage)}
              sx={{
                width: "100%",
                "& .MuiChip-label": {
                  width: "100%",
                  textAlign: "center",
                },
              }}
            />
          </Box>
        )}

        {/* Pricing Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "rgba(25, 118, 210, 0.04)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                mb: 1,
                fontWeight: 500,
              }}
            >
              Monthly Price
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color:
                  packageData.monthly_price_cents === null
                    ? "text.secondary"
                    : "primary.main",
                fontWeight: 700,
              }}
            >
              {formatPrice(packageData.monthly_price_cents)}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "rgba(46, 125, 50, 0.04)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                mb: 1,
                fontWeight: 500,
              }}
            >
              Monthly (Yearly Subscription)
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color:
                  packageData.monthly_price_yearly_subscription_in_cents ===
                  null
                    ? "text.secondary"
                    : "success.main",
                fontWeight: 700,
              }}
            >
              {formatPrice(
                packageData.monthly_price_yearly_subscription_in_cents
              )}
            </Typography>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
