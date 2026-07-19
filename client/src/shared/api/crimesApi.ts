import { apiClient } from 'services/api';

export interface Crime {
  ROWID: string;
  title: string;
  description: string;
  crime_type: string;
  location: string;
  district_id: string;
  station_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  CREATEDTIME: string;
  MODIFIEDTIME: string;
}

export interface CrimeCreate {
  title: string;
  description: string;
  crime_type: string;
  location: string;
  district_id: string;
  station_id: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface CrimeUpdate {
  title?: string;
  description?: string;
  crime_type?: string;
  location?: string;
  district_id?: string;
  station_id?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface CrimeFilters {
  limit?: number;
  offset?: number;
  keyword?: string;
  district_id?: string;
  station_id?: string;
  crime_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const crimesApi = {
  list: (filters?: CrimeFilters) =>
    apiClient.get<Crime[]>('/crimes', { params: filters }),

  getById: (id: string) =>
    apiClient.get<Crime>(`/crimes/${id}`),

  create: (data: CrimeCreate) =>
    apiClient.post<Crime>('/crimes', data),

  update: (id: string, data: CrimeUpdate) =>
    apiClient.put<Crime>(`/crimes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/crimes/${id}`),
};
