import { apiClient } from 'services/api';

export interface RepeatOffender {
  offender_id: string;
  offender_name: string;
  total_offences: number;
  fir_count: number;
  districts_involved: string[];
  police_stations_involved: string[];
  latest_offence?: string;
  repeat_offender_score: number;
}

export interface RepeatOffenderDetail extends RepeatOffender {
  alias?: string;
  age?: number;
  last_known_location?: string;
  risk_level: string;
  status: string;
  crime_categories: string[];
  offence_timeline: Array<{
    crime_id: string;
    crime_type: string;
    district_id: string;
    station_id: string;
    offence_date: string;
    fir_number?: string;
  }>;
}

export interface RepeatOffenderStatistics {
  total_repeat_offenders: number;
  average_offences: number;
  highest_offence_count: number;
  district_with_most_repeat_offenders: string;
  repeat_offender_distribution: Array<{ district: string; repeat_offender_count: number }>;
}

export interface RepeatOffenderFilters {
  district_id?: string;
  station_id?: string;
  crime_type?: string;
  start_date?: string;
  end_date?: string;
  minimum_offences?: number;
  limit?: number;
  offset?: number;
}

export const repeatOffendersApi = {
  list: (filters?: RepeatOffenderFilters) =>
    apiClient.get<RepeatOffender[]>('/repeat-offenders', { params: filters }),

  getTop: (limit = 10, filters?: Omit<RepeatOffenderFilters, 'limit' | 'offset'>) =>
    apiClient.get<RepeatOffender[]>('/repeat-offenders/top', { params: { limit, ...filters } }),

  getById: (id: string) =>
    apiClient.get<RepeatOffenderDetail>(`/repeat-offenders/${id}`),

  getStatistics: (filters?: Omit<RepeatOffenderFilters, 'limit' | 'offset'>) =>
    apiClient.get<RepeatOffenderStatistics>('/repeat-offenders/statistics', { params: filters }),
};
