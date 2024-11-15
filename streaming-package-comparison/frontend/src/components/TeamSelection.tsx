import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Team, TeamSelectionProps } from "../types";

function TeamSelection({
  onTeamsSelected,
  selectedTeams,
}: TeamSelectionProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: teams,
    isLoading,
    error,
  } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await axios.get<Team[]>(
        `${process.env.REACT_APP_API_URL}/api/teams`
      );
      return response.data;
    },
  });

  const filteredTeams =
    teams?.filter((team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleTeamToggle = (team: Team): void => {
    const isSelected = selectedTeams.some((t) => t.id === team.id);
    let newSelectedTeams: Team[];

    if (isSelected) {
      newSelectedTeams = selectedTeams.filter((t) => t.id !== team.id);
    } else {
      newSelectedTeams = [...selectedTeams, team];
    }

    onTeamsSelected(newSelectedTeams);
  };

  if (isLoading)
    return <div className="text-center py-4">Loading teams...</div>;
  if (error)
    return <div className="text-red-600 py-4">Error loading teams</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Select Teams</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search teams..."
          className="w-full px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className={`p-3 rounded-md cursor-pointer border ${
              selectedTeams.some((t) => t.id === team.id)
                ? "bg-primary-100 border-primary-500"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => handleTeamToggle(team)}
          >
            <p className="text-sm font-medium">{team.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamSelection;
