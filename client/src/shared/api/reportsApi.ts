import { apiClient } from 'services/api';

export interface ReportRecord {
  ROWID: string;
  name: string;
  report_type: string;
  parameters_json?: string;
  created_by_officer_id: string;
  status: string;
  CREATEDTIME: string;
  MODIFIEDTIME: string;
}

export interface ReportSummary {
  total_reports: number;
  reports_today: number;
  available_report_types: number;
}

export interface ReportTypeInfo {
  type: string;
  label: string;
  description: string;
}

export interface ReportFilters {
  report_type?: string;
  limit?: number;
  offset?: number;
}

export interface ReportGenerationRequest {
  report_type: string;
  name: string;
  parameters_json?: Record<string, unknown>;
}

export interface GeneratedReportResponse {
  report_id: string;
  title: string;
  type: string;
  generated_at: string;
  generated_by: string;
  parameters: Record<string, unknown>;
  summary: string;
  statistics: Record<string, unknown>;
}

export const reportsApi = {
  list: (filters?: ReportFilters) =>
    apiClient.get<ReportRecord[]>('/reports', { params: filters }),

  getSummary: () =>
    apiClient.get<ReportSummary>('/reports/summary'),

  getTypes: () =>
    apiClient.get<ReportTypeInfo[]>('/reports/types'),

  getById: (id: string) =>
    apiClient.get<ReportRecord>(`/reports/${id}`),

  generate: (data: ReportGenerationRequest) =>
    apiClient.post<GeneratedReportResponse>('/reports/generate', data),

  delete: (id: string) =>
    apiClient.delete(`/reports/${id}`),
};
