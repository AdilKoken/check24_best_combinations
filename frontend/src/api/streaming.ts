import { apiClient } from './client';
import type { Package } from '../types/components';

interface PackageWithCoverage {
  package: Package;
  coverage: number;
}

export const streamingApi = {
  async getAllTeams(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/api/teams/');
    return response.data;
  },

  async getPackagesByTeams(teams: string[], useSoftCoverage: boolean = false): Promise<Package[] | PackageWithCoverage[]> {
    const endpoint = useSoftCoverage ? '/api/packages/by-teams-soft/' : '/api/packages/by-teams/';
    const response = await apiClient.post(endpoint, {
      teams: teams
    });
    return response.data;
  },

  async getAllPackages(): Promise<Package[]> {
    const response = await apiClient.get('/api/packages/');
    return response.data;
  }
};