import React, { useState, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { debounce } from "lodash-es";
import { streamingApi } from "../../api";

interface TeamSelectorProps {
  onTeamsChange: (teams: string[]) => void;
  disabled?: boolean;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  onTeamsChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Debounced search function
  const searchTeams = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const teams = await streamingApi.searchTeams(query);
        setOptions(teams);
      } catch (error) {
        console.error("Error searching teams:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (_event: React.SyntheticEvent, value: string) => {
    if (value.length >= 2) {
      searchTeams(value);
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    setSelectedTeams(newValue);
    onTeamsChange(newValue);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
      <Autocomplete
        multiple
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        loading={loading}
        value={selectedTeams}
        onChange={handleChange}
        onInputChange={handleInputChange}
        disabled={disabled}
        renderTags={(value: string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              key={option}
              color="primary"
              variant="outlined"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Teams"
            placeholder="Type to search teams..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};
