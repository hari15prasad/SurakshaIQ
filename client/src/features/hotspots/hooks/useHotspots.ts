import { useQuery } from '@tanstack/react-query';
import { hotspotsApi, type Hotspot, type DistrictHotspot, type StationHotspot, type HotspotSummary, type HotspotFilters } from 'shared/api';

export function useHotspots(filters?: HotspotFilters) {
  return useQuery({
    queryKey: ['hotspots', filters],
    queryFn: () => hotspotsApi.list(filters).then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useDistrictHotspots() {
  return useQuery({
    queryKey: ['hotspots', 'districts'],
    queryFn: () => hotspotsApi.getDistrictHotspots().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useStationHotspots() {
  return useQuery({
    queryKey: ['hotspots', 'stations'],
    queryFn: () => hotspotsApi.getStationHotspots().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useTopHotspots(limit = 10) {
  return useQuery({
    queryKey: ['hotspots', 'top', limit],
    queryFn: () => hotspotsApi.getTopHotspots(limit).then((res) => res.data),
    staleTime: 30_000,
  });
}

export type { Hotspot, DistrictHotspot, StationHotspot, HotspotSummary, HotspotFilters };
