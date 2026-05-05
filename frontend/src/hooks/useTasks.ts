import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type {
  Task,
  TaskFilters,
  TaskPayload,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

const TASKS_KEY = 'tasks';


export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null),
      );
      const { data } = await api.get<PaginatedResponse<Task>>('/tasks', { params });
      return data;
    },
  });
}


export function useTask(id: number | string) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}


export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TaskPayload) => {
      const { data } = await api.post<ApiResponse<Task>>('/tasks', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}


export function useUpdateTask(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<TaskPayload>) => {
      const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData([TASKS_KEY, id], updated);
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}


export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}


export function useBulkUpdateTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { task_ids: number[]; status: Task['status'] }) => {
      const { data } = await api.post('/tasks/bulk-update', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}
