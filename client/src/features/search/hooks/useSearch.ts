import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchResult, type SearchResponse, type SearchSuggestion, type SearchFilters, type SearchParams } from 'shared/api';

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params).then((res) => res.data),
    enabled: !!params.keyword && params.keyword.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSearchSuggestions(keyword: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', keyword],
    queryFn: () => searchApi.suggestions(keyword).then((res) => res.data),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 1000 * 30,
  });
}

export function useSearchFilters() {
  return useQuery({
    queryKey: ['search', 'filters'],
    queryFn: () => searchApi.filters().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });
}

export type { SearchResult, SearchResponse, SearchSuggestion, SearchFilters, SearchParams };
