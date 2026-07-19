import { apiClient } from 'services/api';

export interface SearchResult {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  relevance_score: number;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResult[];
  filters_applied: Record<string, unknown>;
}

export interface SearchSuggestion {
  keyword: string;
  category: string;
  count: number;
}

export interface SearchFilters {
  categories: Array<{ id: string; label: string }>;
  districts: Array<{ id: string; name: string }>;
  stations: Array<{ id: string; name: string; district_id: string }>;
}

export interface SearchParams {
  keyword?: string;
  category?: string;
  district?: string;
  station?: string;
  limit?: number;
  offset?: number;
}

export const searchApi = {
  search: (params: SearchParams) =>
    apiClient.get<SearchResponse>('/search', { params }),

  suggestions: (keyword: string, limit = 10) =>
    apiClient.get<SearchSuggestion[]>('/search/suggestions', { params: { keyword, limit } }),

  filters: () =>
    apiClient.get<SearchFilters>('/search/filters'),
};
