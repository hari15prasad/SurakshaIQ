import { apiClient } from 'services/api';

export interface AnomalyFactor {
  name: string;
  weight: number;
  contribution: number;
}

export interface Anomaly {
  anomaly_id: string;
  anomaly_type: string;
  severity: string;
  affected_entity_id: string;
  affected_entity_type: string;
  affected_entity_name: string;
  anomaly_score: number;
  contributing_factors: AnomalyFactor[];
  description: string;
  detected_at: string;
}

export interface DistrictAnomaly {
  district_id: string;
  district_name: string;
  anomaly_score: number;
  severity: string;
  crime_count: number;
  fir_count: number;
  hotspot_score: number;
  contributing_factors: AnomalyFactor[];
}

export interface StationAnomaly {
  station_id: string;
  station_name: string;
  district_id: string;
  district_name: string;
  anomaly_score: number;
  severity: string;
  crime_count: number;
  fir_count: number;
  hotspot_score: number;
  contributing_factors: AnomalyFactor[];
}

export interface AnomalySummary {
  total_anomalies: number;
  high_anomalies: number;
  critical_anomalies: number;
  affected_districts: number;
  affected_stations: number;
  average_anomaly_score: number;
  anomaly_distribution: Array<{
    anomaly_id: string;
    anomaly_type: string;
    severity: string;
    affected_entity_id: string;
    affected_entity_type: string;
    affected_entity_name: string;
    anomaly_score: number;
  }>;
}

export const anomaliesApi = {
  list: (limit = 100) =>
    apiClient.get<Anomaly[]>('/anomaly', { params: { limit } }),

  getSummary: () =>
    apiClient.get<AnomalySummary>('/anomaly/summary'),

  getDistrictAnomalies: () =>
    apiClient.get<DistrictAnomaly[]>('/anomaly/districts'),

  getStationAnomalies: () =>
    apiClient.get<StationAnomaly[]>('/anomaly/stations'),

  getById: (anomalyId: string) =>
    apiClient.get<Anomaly>(`/anomaly/${anomalyId}`),
};
