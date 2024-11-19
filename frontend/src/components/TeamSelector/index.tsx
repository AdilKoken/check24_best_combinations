import React from "react";
import type { TeamSelectorProps } from "../../types";
import "./styles.css";

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedTeams,
  onTeamsChange,
  isLoading = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTeams = React.useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter((team) => team.toLowerCase().includes(query));
  }, [teams, searchQuery]);

  const handleTeamToggle = (team: string) => {
    const updatedSelection = selectedTeams.includes(team)
      ? selectedTeams.filter((t) => t !== team)
      : [...selectedTeams, team];
    onTeamsChange(updatedSelection);
  };

  if (isLoading) {
    return <div className="team-selector-loading">Loading teams...</div>;
  }

  if (error) {
    return <div className="team-selector-error">{error}</div>;
  }

  return (
    <div className="team-selector-container">
      <div className="team-selector-header">
        <input
          type="text"
          className="team-search-input"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {selectedTeams.length > 0 && (
          <button
            className="clear-selection-button"
            onClick={() => onTeamsChange([])}
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="teams-grid">
        {filteredTeams.map((team) => (
          <button
            key={team}
            className={`team-button ${
              selectedTeams.includes(team) ? "selected" : ""
            }`}
            onClick={() => handleTeamToggle(team)}
          >
            {team}
          </button>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="no-results">
          No teams found matching "{searchQuery}"
        </div>
      )}

      <div className="selection-summary">
        Selected: {selectedTeams.length} teams
      </div>
    </div>
  );
};
