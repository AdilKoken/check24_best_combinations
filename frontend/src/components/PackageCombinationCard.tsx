import React from "react";
import { Card, CardContent, Typography, Box, Paper, Chip } from "@mui/material";
import { PackageCombinationCardProps } from "../types/components";
import { formatPrice } from "../utils";

const PackageCombinationCard: React.FC<PackageCombinationCardProps> = ({
  combination,
}) => {
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
      }}
    >
      <CardContent sx={{ height: "100%", p: 3 }}>
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
          Package Combination
        </Typography>

        {/* Package Names */}
        <Box sx={{ mb: 3 }}>
          {combination.packages.map((pkg) => (
            <Chip
              key={pkg.id}
              label={pkg.name}
              sx={{ m: 0.5 }}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>

        {/* Pricing Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              sx={{ color: "text.secondary", mb: 1 }}
            >
              Monthly Price
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color:
                  combination.total_monthly_price === null
                    ? "text.secondary"
                    : "primary.main",
                fontWeight: 700,
              }}
            >
              {formatPrice(combination.total_monthly_price)}
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
              sx={{ color: "text.secondary", mb: 1 }}
            >
              Monthly (Yearly Subscription)
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color:
                  combination.total_yearly_by_monthly === null
                    ? "text.secondary"
                    : "success.main",
                fontWeight: 700,
              }}
            >
              {formatPrice(combination.total_yearly_by_monthly)}
            </Typography>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PackageCombinationCard;
