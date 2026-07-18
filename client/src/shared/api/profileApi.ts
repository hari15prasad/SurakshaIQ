import apiClient from './client';
import type { Officer } from 'shared/auth/types';

export interface OfficerProfileResponse {
  officer: Officer;
}

export const profileApi = {
  /**
   * Fetch the authenticated officer's profile from the backend.
   * The backend identifies the user from the Catalyst session cookie.
   */
  fetchProfile: async (): Promise<OfficerProfileResponse> => {
    const response = await apiClient.get<{ data: OfficerProfileResponse }>('/auth/profile');
    return response.data.data;
  },
};
