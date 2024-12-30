import { apiClient } from './client';
import type { Package, PackageCombination } from '../types/components';

interface PackageWithCoverage {
  package: Package;
  coverage: number;
}

export const streamingApi = {
  async getAllTeams(): Promise<string[]> {
    const response = await apiClient.get('/api/teams/');
    return response.data;
  },

  async searchTeams(query: string): Promise<string[]> {
    const response = await apiClient.get(`/api/teams/search/?query=${query}`);
    return response.data;
  },

  async getAllPackages(): Promise<Package[]> {
    const response = await apiClient.get('/api/packages/');
    return response.data;
  },

  async getPackagesByTeams(
    teams: string[], 
    useSoftCoverage = false
  ): Promise<Package[] | PackageWithCoverage[]> {
    const endpoint = useSoftCoverage ? '/api/packages/by-teams-soft/' : '/api/packages/by-teams/';
    const response = await apiClient.post(endpoint, { teams });
    return response.data;
  },

  async getPackageCombinations(
    teams: string[], 
    packagesToExclude: Package[] = []
  ): Promise<PackageCombination[]> {
    const response = await apiClient.post('/api/packages/combinations/', {
      teams: teams,
      packages_to_exclude: packagesToExclude.map(pkg => pkg.id)
    });
    return response.data;
  },

  async getPackageCombinationsBackup(
    teams: string[], 
    packagesToExclude: Package[] = []
  ): Promise<PackageCombination[]> {
    const response = await apiClient.post('/api/packages/combinations-backup/', {
      teams: teams,
      packages_to_exclude: packagesToExclude.map(pkg => pkg.id)
    });
    return response.data;
  }
};