import React from "react";
import { TeamSelector } from "./components/TeamSelector";
import { FilterSection } from "./components/FilterSection";
import { PackageList } from "./components/PackageList";
import { ComparisonTable } from "./components/ComparisonTable";
import type { FilterOptions } from "./types";
import "./styles/App.css";

const App: React.FC = () => {
  const [teams, setTeams] = React.useState<string[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [teamsError, setTeamsError] = React.useState<string | null>(null);

  const [selectedPackages, setSelectedPackages] = React.useState<number[]>([]);
  const [filters, setFilters] = React.useState<FilterOptions>({
    selectedTeams: [],
    minPrice: 0,
    maxPrice: 1000,
    requireLive: false,
    requireHighlights: false,
    minCoverage: 0,
  });

  const handleTeamsChange = (selectedTeams: string[]) => {
    setFilters((prev) => ({ ...prev, selectedTeams }));
    setSelectedPackages([]);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Streaming Package Comparison</h1>
        <p>Find the best combination of streaming packages</p>
      </header>

      <main className="app-content">
        <div className="content-grid">
          <aside className="filters-sidebar">
            <FilterSection onFilterChange={handleFilterChange} teams={teams} />
          </aside>

          <div className="main-content">
            <section className="section">
              <h2>Select Teams</h2>
              <TeamSelector
                teams={teams}
                selectedTeams={filters.selectedTeams}
                onTeamsChange={handleTeamsChange}
                isLoading={teamsLoading}
                error={teamsError}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
