import React from "react";
import { FilterOptions } from "./types";
import "./styles.css";

interface FilterSectionProps {
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  teams: string[];
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  onFilterChange,
  teams,
}) => {
  const [priceRange, setPriceRange] = React.useState({ min: 0, max: 1000 });
  const [coverage, setCoverage] = React.useState(0);
  const [requirements, setRequirements] = React.useState({
    live: false,
    highlights: false,
  });

  const handlePriceChange = React.useCallback(
    (min: number, max: number) => {
      setPriceRange({ min, max });
      onFilterChange({ minPrice: min, maxPrice: max });
    },
    [onFilterChange]
  );

  const handleCoverageChange = React.useCallback(
    (value: number) => {
      setCoverage(value);
      onFilterChange({ minCoverage: value });
    },
    [onFilterChange]
  );

  const handleRequirementChange = React.useCallback(
    (key: "live" | "highlights", value: boolean) => {
      setRequirements((prev) => {
        const updated = { ...prev, [key]: value };
        onFilterChange({
          requireLive: updated.live,
          requireHighlights: updated.highlights,
        });
        return updated;
      });
    },
    [onFilterChange]
  );

  return (
    <div className="filter-section">
      <div className="filter-group">
        <label>Price Range (€/month)</label>
        <div className="price-inputs">
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) =>
              handlePriceChange(Number(e.target.value), priceRange.max)
            }
            min={0}
          />
          <span>to</span>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) =>
              handlePriceChange(priceRange.min, Number(e.target.value))
            }
            min={priceRange.min}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Minimum Coverage (%)</label>
        <input
          type="range"
          value={coverage}
          onChange={(e) => handleCoverageChange(Number(e.target.value))}
          min={0}
          max={100}
        />
        <span>{coverage}%</span>
      </div>

      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={requirements.live}
            onChange={(e) => handleRequirementChange("live", e.target.checked)}
          />
          Require Live Streaming
        </label>
      </div>

      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={requirements.highlights}
            onChange={(e) =>
              handleRequirementChange("highlights", e.target.checked)
            }
          />
          Require Highlights
        </label>
      </div>
    </div>
  );
};
