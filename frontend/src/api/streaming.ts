import { apiClient } from './client';
import type { 
    Game, 
    StreamingPackage, 
    PackageComparison,
    PackageCombination 
} from '../types/data';

export const streamingApi = {
    /**
     * Get all available teams (both home and away teams)
     */
    async getTeams(): Promise<string[]> {
        const response = await apiClient.get<string[]>('/api/teams');
        return response.data;
    },

    /**
     * Search teams by name
     */
    async searchTeams(query: string): Promise<string[]> {
        const response = await apiClient.get<string[]>('/api/teams/search', {
            params: { query }
        });
        return response.data;
    },

    /**
     * Get package comparisons for selected teams
     */
    async comparePackages(selectedTeams: string[]): Promise<PackageComparison[]> {
        const response = await apiClient.post<PackageComparison[]>('/api/packages/compare', {
            teams: selectedTeams
        });
        return response.data;
    },

    /**
     * Find the best combinations of packages for complete coverage
     */
    async findBestCombinations(teams: string[]): Promise<PackageCombination[]> {
        const response = await apiClient.post<PackageCombination[]>('/api/packages/combinations', {
            teams
        });
        return response.data;
    },

    /**
     * Get all games for selected teams
     */
    async getTeamGames(teams: string[]): Promise<Game[]> {
        const response = await apiClient.post<Game[]>('/api/games/teams', {
            teams
        });
        return response.data;
    },

    /**
     * Get all available streaming packages
     */
    async getAllPackages(): Promise<StreamingPackage[]> {
        const response = await apiClient.get<StreamingPackage[]>('/api/packages');
        return response.data;
    }
};