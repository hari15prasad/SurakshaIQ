import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type SummaryResponse, type RecentCrimeResponse, type RecentFirResponse, type CrimeTrendResponse, type DistrictSummaryResponse } from 'shared/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.getDashboardSummary().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useRecentCrimes(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-crimes', limit],
    queryFn: () => dashboardApi.getRecentCrimes(limit).then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useRecentFirs(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-firs', limit],
    queryFn: () => dashboardApi.getRecentFirs(limit).then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useCrimeTrends(interval = 'daily') {
  return useQuery({
    queryKey: ['dashboard', 'crime-trends', interval],
    queryFn: () => dashboardApi.getCrimeTrends(interval).then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useDistrictSummary() {
  return useQuery({
    queryKey: ['dashboard', 'district-summary'],
    queryFn: () => dashboardApi.getDistrictSummary().then((res) => res.data),
    staleTime: 60_000,
  });
}

export type { SummaryResponse, RecentCrimeResponse, RecentFirResponse, CrimeTrendResponse, DistrictSummaryResponse };
