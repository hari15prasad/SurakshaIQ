import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, type ReportRecord, type ReportSummary, type ReportTypeInfo, type ReportFilters, type GeneratedReportResponse } from 'shared/api';

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsApi.list(filters).then((res) => res.data),
  });
}

export function useReportSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => reportsApi.getSummary().then((res) => res.data),
  });
}

export function useReportTypes() {
  return useQuery({
    queryKey: ['reports', 'types'],
    queryFn: () => reportsApi.getTypes().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { report_type: string; name: string; parameters_json?: Record<string, unknown> }) =>
      reportsApi.generate(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportsApi.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export type { ReportRecord, ReportSummary, ReportTypeInfo, ReportFilters, GeneratedReportResponse };
