import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamSelection from "./components/TeamSelection";
import PackageComparison from "./components/PackageComparison";
import Layout from "./components/Layout";
import { Team } from "./types";

const queryClient = new QueryClient();

function App(): JSX.Element {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const handleTeamSelection = (teams: Team[]): void => {
    setSelectedTeams(teams);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Streaming Package Comparison
          </h1>

          <TeamSelection
            onTeamsSelected={handleTeamSelection}
            selectedTeams={selectedTeams}
          />

          {selectedTeams.length > 0 && (
            <PackageComparison selectedTeams={selectedTeams} />
          )}
        </div>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
