import axios from 'axios';
import { PackageComparison } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const streamingService = {
  async getAvailableTeams(): Promise<string[]> {
    const response = await api.get<{ teams: string[] }>('/available-teams/');
    return response.data.teams;
  },

  async comparePackages(teams: string[]): Promise<PackageComparison> {
    const response = await api.post<PackageComparison>('/compare-packages/', { teams });
    return response.data;
  }
};

export default streamingService;