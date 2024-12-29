import { apiClient } from './client';
import type { 
    Game, 
    StreamingPackage, 
    PackageComparison,
    PackageCombination 
} from '../types/data';

export const streamingApi = {
    async getTeams(): Promise<string[]> {
        const response = await apiClient.get<string[]>('/api/teams');
        return response.data;
    },

    async searchTeams(query: string): Promise<string[]> {
        const response = await apiClient.get<string[]>('/api/teams/search', {
            params: { query }
        });
        return response.data;
    },

    async comparePackages(selectedTeams: string[]): Promise<PackageComparison[]> {
        const response = await apiClient.post<PackageComparison[]>('/api/packages/compare', {
            teams: selectedTeams
        });
        return response.data;
    },

    async findBestCombinations(teams: string[]): Promise<PackageCombination[]> {
        const response = await apiClient.post<PackageCombination[]>('/api/packages/combinations', {
            teams
        });
        return response.data;
    },

    async getTeamGames(teams: string[]): Promise<Game[]> {
        const response = await apiClient.post<Game[]>('/api/games/teams', {
            teams
        });
        return response.data;
    },

    async getAllPackages(): Promise<StreamingPackage[]> {
        const response = await apiClient.get<{results: StreamingPackage[]}>('/api/packages/');
        return response.data.results;  // Extract results from the paginated response
    }
};