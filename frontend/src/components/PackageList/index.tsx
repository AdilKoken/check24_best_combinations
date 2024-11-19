import React, { useMemo } from "react";
import { Package, PackageListProps } from "./types";
import "./styles.css";

/**
 * PackageList Component
 *
 * Displays a sortable list of streaming packages with their details and allows for package selection.
 * Features include:
 * - Sortable columns (price, coverage, etc.)
 * - Package selection for comparison
 * - Visual indicators for coverage and pricing
 * - Responsive design
 *
 * @component
 * @example
 * ```tsx
 * <PackageList
 *   packages={streamingPackages}
 *   selectedPackages={[1, 2]}
 *   onPackageSelect={(id) => handlePackageSelect(id)}
 * />
 * ```
 */
export const PackageList: React.FC<PackageListProps> = ({
  packages,
  selectedPackages,
  onPackageSelect,
}) => {
  // State for sorting configuration
  const [sortBy, setSortBy] = React.useState<keyof Package>(
    "coverage_percentage"
  );
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );

  /**
   * Formats price in cents to a readable Euro amount.
   * @param cents - Price in cents.
   * @returns Formatted price string or 'N/A' if price is null or undefined.
   */
  const formatPrice = (cents: number | null | undefined): string => {
    if (cents == null) return "N/A";
    return `€${(cents / 100).toFixed(2)}`;
  };

  /**
   * Handles sort column change.
   * @param column - Column to sort by.
   */
  const handleSortChange = (column: keyof Package) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  /**
   * Renders sort indicator for column headers.
   * @param column - Column to show indicator for.
   * @returns Sort indicator element or null.
   */
  const renderSortIndicator = (column: keyof Package) => {
    if (sortBy !== column) return null;
    return (
      <span className="sort-indicator" aria-hidden="true">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  /**
   * Compares two values for sorting.
   * @param aValue - First value.
   * @param bValue - Second value.
   * @returns Comparison result.
   */
  const compareValues = (aValue: any, bValue: any) => {
    if (aValue == null && bValue == null) {
      return 0;
    } else if (aValue == null) {
      return 1; // Nulls last
    } else if (bValue == null) {
      return -1;
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    } else if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue);
    } else {
      return 0;
    }
  };

  /**
   * Memoized sorted packages based on current sort configuration.
   */
  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const comparison = compareValues(aValue, bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [packages, sortBy, sortDirection]);

  /**
   * Gets the appropriate aria-sort value for a column.
   * @param column - The column to get aria-sort value for.
   * @returns The aria-sort value.
   */
  const getAriaSort = (
    column: keyof Package
  ): "none" | "ascending" | "descending" => {
    if (sortBy === column) {
      return sortDirection === "asc" ? "ascending" : "descending";
    }
    return "none";
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="package-list-empty">
        No packages found matching your criteria
      </div>
    );
  }

  return (
    <div className="package-list" role="region" aria-label="Streaming packages">
      <table>
        <thead>
          <tr>
            <th className="select-column">
              <span className="visually-hidden">Select</span>
            </th>
            <th
              onClick={() => handleSortChange("name")}
              className="sortable"
              role="columnheader"
              aria-sort={getAriaSort("name")}
            >
              Package Name {renderSortIndicator("name")}
            </th>
            <th
              onClick={() => handleSortChange("monthly_price")}
              className="sortable"
              role="columnheader"
              aria-sort={getAriaSort("monthly_price")}
            >
              Monthly Price {renderSortIndicator("monthly_price")}
            </th>
            <th
              onClick={() => handleSortChange("yearly_price_monthly")}
              className="sortable"
              role="columnheader"
              aria-sort={getAriaSort("yearly_price_monthly")}
            >
              Yearly Price (Monthly){" "}
              {renderSortIndicator("yearly_price_monthly")}
            </th>
            <th
              onClick={() => handleSortChange("coverage_percentage")}
              className="sortable"
              role="columnheader"
              aria-sort={getAriaSort("coverage_percentage")}
            >
              Coverage {renderSortIndicator("coverage_percentage")}
            </th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {sortedPackages.map((pkg) => (
            <tr
              key={pkg.id}
              className={selectedPackages.includes(pkg.id) ? "selected" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedPackages.includes(pkg.id)}
                  onChange={() => onPackageSelect(pkg.id)}
                  aria-label={`Select ${pkg.name}`}
                />
              </td>
              <td>{pkg.name}</td>
              <td>{formatPrice(pkg.monthly_price)}</td>
              <td>{formatPrice(pkg.yearly_price_monthly)}</td>
              <td>
                <div
                  className="coverage-bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pkg.coverage_percentage ?? 0}
                >
                  <div
                    className="coverage-fill"
                    style={{
                      width: `${pkg.coverage_percentage ?? 0}%`,
                    }}
                  />
                  <span>
                    {pkg.coverage_percentage != null
                      ? pkg.coverage_percentage.toFixed(1)
                      : "N/A"}
                    %
                  </span>
                </div>
              </td>
              <td>
                <div className="package-details">
                  <div className="matches-info">
                    <div>Live: {pkg.live_matches}</div>
                    <div>Highlights: {pkg.highlights_matches}</div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="selection-info" aria-live="polite">
        {selectedPackages.length > 0 ? (
          <p>Selected {selectedPackages.length} packages for comparison</p>
        ) : (
          <p>Select packages to compare</p>
        )}
      </div>
    </div>
  );
};

/**
 * Ensure package list is loaded with proper typings and used with required props.
 */
PackageList.displayName = "PackageList";
