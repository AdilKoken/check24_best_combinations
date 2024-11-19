import React, { useMemo } from "react";
import { ComparisonTableProps, ComparisonMetrics } from "./types";
import "./styles.css";

/**
 * ComparisonTable shows a detailed comparison of selected streaming packages,
 * including coverage analysis, cost calculations, and package combinations.
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  packages,
  totalGames,
  selectedPackages,
}) => {
  // Filter selected packages
  const selectedPackageDetails = useMemo(() => {
    return packages.filter((pkg) => selectedPackages.includes(pkg.id));
  }, [packages, selectedPackages]);

  // Calculate comparison metrics for the selected package combination
  const metrics = useMemo((): ComparisonMetrics => {
    const coveredGames = new Set<number>();
    const liveGames = new Set<number>();
    const highlightGames = new Set<number>();
    let totalMonthlyCost = 0;

    selectedPackageDetails.forEach((pkg) => {
      // Use yearly price if available (usually cheaper), otherwise monthly
      const monthlyPrice = pkg.yearly_price_monthly ?? pkg.monthly_price ?? 0;
      totalMonthlyCost += monthlyPrice;
    });

    return {
      totalCoverage: (coveredGames.size / totalGames) * 100,
      totalCost: totalMonthlyCost,
      liveCoverage: (liveGames.size / totalGames) * 100,
      highlightsCoverage: (highlightGames.size / totalGames) * 100,
    };
  }, [selectedPackageDetails, totalGames]);

  // Format price in cents to Euro
  const formatPrice = (cents: number): string => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  if (selectedPackages.length === 0) {
    return (
      <div className="comparison-table-empty">
        Select packages to see detailed comparison
      </div>
    );
  }

  return (
    <div className="comparison-table-container">
      <h2>Package Combination Analysis</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Monthly Cost</h3>
          <div className="metric-value">{formatPrice(metrics.totalCost)}</div>
          <div className="metric-subtitle">Per Month</div>
        </div>

        <div className="metric-card">
          <h3>Total Coverage</h3>
          <div className="metric-value">
            {metrics.totalCoverage.toFixed(1)}%
          </div>
          <div className="metric-subtitle">{totalGames} Total Games</div>
        </div>

        <div className="metric-card">
          <h3>Live Coverage</h3>
          <div className="metric-value">{metrics.liveCoverage.toFixed(1)}%</div>
          <div className="metric-subtitle">Live Streaming</div>
        </div>

        <div className="metric-card">
          <h3>Highlights Coverage</h3>
          <div className="metric-value">
            {metrics.highlightsCoverage.toFixed(1)}%
          </div>
          <div className="metric-subtitle">Match Highlights</div>
        </div>
      </div>

      <div className="comparison-details">
        <h3>Selected Packages</h3>
        <div className="packages-grid">
          {selectedPackageDetails.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <div className="package-card-header">
                <h4>{pkg.name}</h4>
                <div className="package-price">
                  {pkg.yearly_price_monthly ? (
                    <>
                      <div className="price-primary">
                        {formatPrice(pkg.yearly_price_monthly)}
                        <span className="price-period">/month</span>
                      </div>
                      <div className="price-yearly">Yearly subscription</div>
                    </>
                  ) : (
                    <div className="price-primary">
                      {formatPrice(pkg.monthly_price ?? 0)}
                      <span className="price-period">/month</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="package-stats">
                <div className="stat-row">
                  <span>Coverage</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pkg.coverage_percentage}%` }}
                    />
                    <span>
                      {pkg.coverage_percentage != null
                        ? `${pkg.coverage_percentage.toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="stat-row">
                  <span>Live Games</span>
                  <span>{pkg.live_matches}</span>
                </div>

                <div className="stat-row">
                  <span>Highlights</span>
                  <span>{pkg.highlights_matches}</span>
                </div>
              </div>

              <div className="package-features">
                <div
                  className={`feature ${
                    pkg.live_matches > 0 ? "available" : ""
                  }`}
                >
                  <span className="feature-icon">
                    {pkg.live_matches > 0 ? "✓" : "✗"}
                  </span>
                  Live Streaming
                </div>
                <div
                  className={`feature ${
                    pkg.highlights_matches > 0 ? "available" : ""
                  }`}
                >
                  <span className="feature-icon">
                    {pkg.highlights_matches > 0 ? "✓" : "✗"}
                  </span>
                  Match Highlights
                </div>
              </div>
            </div>
          ))}
        </div>

        {metrics.totalCoverage < 100 && (
          <div className="coverage-warning">
            <h4>Coverage Gap</h4>
            <p>
              This combination leaves {(100 - metrics.totalCoverage).toFixed(1)}
              % of games uncovered. Consider adding more packages or exploring
              alternative combinations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
