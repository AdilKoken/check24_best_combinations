import React from "react";
import { Package } from "../types";

interface PackageComparisonProps {
  packages: Package[];
  totalGames: number;
}

export const PackageComparison: React.FC<PackageComparisonProps> = ({
  packages,
  totalGames,
}) => {
  return (
    <div className="package-comparison">
      <h2>Package Comparison</h2>
      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Monthly Price</th>
              <th>Yearly Price (Monthly)</th>
              <th>Total Matches</th>
              <th>Live Matches</th>
              <th>Highlights</th>
              <th>Coverage %</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.name}</td>
                <td>
                  {pkg.monthly_price
                    ? `€${pkg.monthly_price.toFixed(2)}`
                    : "N/A"}
                </td>
                <td>
                  {pkg.yearly_price_monthly
                    ? `€${pkg.yearly_price_monthly.toFixed(2)}`
                    : "N/A"}
                </td>
                <td>{pkg.total_matches}</td>
                <td>{pkg.live_matches}</td>
                <td>{pkg.highlights_matches}</td>
                <td>{pkg.coverage_percentage?.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="total-games">Total Games Available: {totalGames}</div>
    </div>
  );
};
