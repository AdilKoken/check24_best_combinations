// PackageCard.tsx
import React from "react";
import { Card, CardContent, Typography, Box, Paper } from "@mui/material";
import { PackageCardProps } from "../types";
import { formatPrice } from "../utils";

const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => (
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
        {pkg.name}
      </Typography>

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
                pkg.monthly_price_cents === null
                  ? "text.secondary"
                  : "primary.main",
              fontWeight: 700,
            }}
          >
            {formatPrice(pkg.monthly_price_cents)}
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
                pkg.monthly_price_yearly_subscription_in_cents === null
                  ? "text.secondary"
                  : "success.main",
              fontWeight: 700,
            }}
          >
            {formatPrice(pkg.monthly_price_yearly_subscription_in_cents)}
          </Typography>
        </Paper>
      </Box>
    </CardContent>
  </Card>
);

export default PackageCard;
