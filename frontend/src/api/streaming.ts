import { apiClient } from './client';
import type { 
    StreamingPackage, 
} from '../types/data';

export const streamingApi = {
    async getAllTeams(): Promise<string[]> {
        const response = await apiClient.get<string[]>('/api/teams/');
        return Array.isArray(response.data) ? response.data : response.data.results;
    },

    async getPackagesByTeams(teams: string[]): Promise<StreamingPackage[]> {
        const response = await apiClient.post<{results: StreamingPackage[]}>('/api/packages/by-teams/', {
            teams: teams  // Make sure we're sending the data in correct format
        });
        return response.data
    },

    async getAllPackages(): Promise<StreamingPackage[]> {
        const response = await apiClient.get<{results: StreamingPackage[]}>('/api/packages/');
        return response.data;
    }
};