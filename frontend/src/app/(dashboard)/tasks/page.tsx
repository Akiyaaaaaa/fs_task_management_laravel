'use client';

import React, { useState, useCallback } from 'react';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useEcho } from '@/hooks/useEcho';
import dynamic from 'next/dynamic';
import { TaskFiltersBar } from '@/components/tasks/TaskFilters';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/Button';
import { debounce } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import type { TaskFilters } from '@/types';

const TaskModal = dynamic(
  () => import('@/components/tasks/TaskModal').then((m) => m.TaskModal),
  { ssr: false },
);

export default function TasksPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    sort_by: 'created_at',
    sort_dir: 'desc',
    per_page: 10,
    page: 1,
  });
  const [isExporting, setIsExporting] = useState(false);

  const activeFilters: TaskFilters = {
    ...filters,
    search: searchValue || undefined,
  };

  const { data, isLoading, isError } = useTasks(activeFilters);

  const handleExportReady = useCallback(
    (data: { download_url: string; filename: string }) => {
      setIsExporting(false);
      toast.success('Export Ready!', {
        description: `Your file ${data.filename} is ready to download.`,
        action: {
          label: 'Download',
          onClick: async () => {
            try {
              const response = await api.get(data.download_url, {
                responseType: 'blob',
              });

              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', data.filename);
              document.body.appendChild(link);
              link.click();

              link.parentNode?.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (error) {
              toast.error('Gagal men-download file. Silakan coba lagi.');
            }
          },
        },
        duration: 10000,
      });
    },
    [],
  );

  useEcho({
    userId: user?.id,
    onExportReady: handleExportReady,
  });

  const triggerExport = async () => {
    setIsExporting(true);
    try {
      await api.post('/tasks/export');
      toast.info('Export started. You will be notified when it is ready.');
    } catch {
      toast.error('Failed to start export.');
      setIsExporting(false);
    }
  };

  const handleSearch = useCallback(
    debounce((val: string) => {
      setSearchValue(val);
      setFilters((p) => ({ ...p, page: 1 }));
    }, 350),
    [],
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'rgb(248,250,252)',
              marginBottom: '4px',
            }}
          >
            Tasks
          </h1>
          <p style={{ fontSize: '14px', color: 'rgb(100,116,139)' }}>
            Manage and track your team&apos;s work
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            id="export-tasks-btn"
            variant="secondary"
            leftIcon={<Download size={16} />}
            loading={isExporting}
            onClick={triggerExport}
          >
            {isExporting ? 'Processing...' : 'Export'}
          </Button>

          <Button
            id="create-task-btn"
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            New Task
          </Button>
        </div>
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px',
        }}
      >
        <TaskFiltersBar
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          searchValue={searchValue}
          total={data?.total}
        />
      </div>

      {isError && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'rgb(239,68,68)',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          Failed to load tasks. Please check your API connection and try again.
        </div>
      )}

      <TaskList
        tasks={data?.data ?? []}
        isLoading={isLoading}
        currentPage={data?.current_page ?? 1}
        lastPage={data?.last_page ?? 1}
        total={data?.total ?? 0}
        perPage={data?.per_page ?? 10}
        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
      />

      <TaskModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
