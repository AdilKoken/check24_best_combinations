import React, { useState, useEffect } from "react";
import { streamingService } from "../services/api";

interface TeamSelectorProps {
  onTeamsSelected: (teams: string[]) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  onTeamsSelected,
}) => {
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teams = await streamingService.getAvailableTeams();
        setAvailableTeams(teams);
      } catch (error) {
        console.error("Failed to load teams:", error);
      }
    };

    loadTeams();
  }, []);

  const handleTeamToggle = (team: string) => {
    const newSelection = selectedTeams.includes(team)
      ? selectedTeams.filter((t) => t !== team)
      : [...selectedTeams, team];

    setSelectedTeams(newSelection);
    onTeamsSelected(newSelection);
  };

  return (
    <div className="team-selector">
      <h2>Select Teams</h2>
      <div className="teams-grid">
        {availableTeams.map((team) => (
          <button
            key={team}
            onClick={() => handleTeamToggle(team)}
            className={`team-button ${
              selectedTeams.includes(team) ? "selected" : ""
            }`}
          >
            {team}
          </button>
        ))}
      </div>
    </div>
  );
};
