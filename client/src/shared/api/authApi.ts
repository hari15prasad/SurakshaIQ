import apiClient from './client';

export const authApi = {
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
