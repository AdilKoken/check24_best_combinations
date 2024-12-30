// TeamSelector.tsx
import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Box } from "@mui/material";
import { streamingApi } from "../api";

interface TeamSelectorProps {
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeams,
  onTeamsChange,
}) => {
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log("Fetching teams..."); // Debug log
        const teams = await streamingApi.getAllTeams();
        console.log("Received teams:", teams); // Debug log
        setAllTeams(teams || []); // Add fallback empty array
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Debug log for render
  console.log("TeamSelector render:", { allTeams, selectedTeams });

  return (
    <Box sx={{ mb: 3 }}>
      <Autocomplete
        multiple
        options={allTeams}
        value={selectedTeams}
        onChange={(_, newValue) => onTeamsChange(newValue)}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Teams"
            placeholder="Search teams..."
            error={!loading && allTeams.length === 0} // Show error if no teams loaded
            helperText={
              !loading && allTeams.length === 0 ? "Failed to load teams" : ""
            }
          />
        )}
      />
    </Box>
  );
};

export default TeamSelector;
