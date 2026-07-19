import { apiClient } from 'services/api';

export const authApi = {
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
