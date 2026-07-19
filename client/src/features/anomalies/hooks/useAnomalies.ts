import { useQuery } from '@tanstack/react-query';
import { anomaliesApi, type Anomaly, type DistrictAnomaly, type StationAnomaly, type AnomalySummary } from 'shared/api';

export function useAnomalies(limit = 100) {
  return useQuery({
    queryKey: ['anomalies', limit],
    queryFn: () => anomaliesApi.list(limit).then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useAnomalySummary() {
  return useQuery({
    queryKey: ['anomalies', 'summary'],
    queryFn: () => anomaliesApi.getSummary().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useDistrictAnomalies() {
  return useQuery({
    queryKey: ['anomalies', 'districts'],
    queryFn: () => anomaliesApi.getDistrictAnomalies().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useStationAnomalies() {
  return useQuery({
    queryKey: ['anomalies', 'stations'],
    queryFn: () => anomaliesApi.getStationAnomalies().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useAnomaly(anomalyId: string) {
  return useQuery({
    queryKey: ['anomalies', anomalyId],
    queryFn: () => anomaliesApi.getById(anomalyId).then((res) => res.data),
    enabled: !!anomalyId,
    staleTime: 30_000,
  });
}

export type { Anomaly, DistrictAnomaly, StationAnomaly, AnomalySummary };
