import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useTasks } from './useTasks';
import type { PaginatedResponse, Task } from '@/types';

const mockTaskData: PaginatedResponse<Task> = {
  data: [
    {
      id: 1,
      title: 'Mocked Task 1',
      description: 'Desc 1',
      status: 'pending',
      priority: 'high',
      assigned_user_id: 1,
      created_by: 1,
      due_date: null,
      created_at: '2026-05-04T10:00:00Z',
      updated_at: '2026-05-04T10:00:00Z',
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 1,
  from: 1,
  to: 1,
  links: [],
};

const server = setupServer(
  http.get('*/api/tasks', () => {
    return HttpResponse.json(mockTaskData);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = renderHook(() => useTasks(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    ),
  });
  return {
    ...result,
    rerender: () =>
      rerender({
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
        ),
      }),
  };
}

describe('useTasks Hook Integration', () => {
  it('fetches and returns task data correctly', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].title).toBe('Mocked Task 1');
  });
});
