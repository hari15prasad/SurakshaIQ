import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crimesApi, type CrimeCreate, type CrimeUpdate, type CrimeFilters } from 'shared/api';

export function useCrimes(filters?: CrimeFilters) {
  return useQuery({
    queryKey: ['crimes', filters],
    queryFn: () => crimesApi.list(filters).then((res) => res.data),
  });
}

export function useCrime(id: string) {
  return useQuery({
    queryKey: ['crimes', id],
    queryFn: () => crimesApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateCrime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrimeCreate) => crimesApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crimes'] });
    },
  });
}

export function useUpdateCrime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CrimeUpdate }) =>
      crimesApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crimes'] });
    },
  });
}

export function useDeleteCrime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crimesApi.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crimes'] });
    },
  });
}
