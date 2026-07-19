import { useQuery } from '@tanstack/react-query';
import { repeatOffendersApi, type RepeatOffender, type RepeatOffenderDetail, type RepeatOffenderStatistics, type RepeatOffenderFilters } from 'shared/api';

export function useRepeatOffenders(filters?: RepeatOffenderFilters) {
  return useQuery({
    queryKey: ['repeat-offenders', filters],
    queryFn: () => repeatOffendersApi.list(filters).then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useTopRepeatOffenders(limit = 10) {
  return useQuery({
    queryKey: ['repeat-offenders', 'top', limit],
    queryFn: () => repeatOffendersApi.getTop(limit).then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useRepeatOffender(id: string) {
  return useQuery({
    queryKey: ['repeat-offenders', id],
    queryFn: () => repeatOffendersApi.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useRepeatOffenderStatistics() {
  return useQuery({
    queryKey: ['repeat-offenders', 'statistics'],
    queryFn: () => repeatOffendersApi.getStatistics().then((res) => res.data),
    staleTime: 60_000,
  });
}

export type { RepeatOffender, RepeatOffenderDetail, RepeatOffenderStatistics, RepeatOffenderFilters };
