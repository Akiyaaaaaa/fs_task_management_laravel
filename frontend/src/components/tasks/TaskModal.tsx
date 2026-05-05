'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import type { Task, TaskPayload } from '@/types';

const STATUS_OPTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const defaultForm: TaskPayload = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  assigned_user_id: null,
  due_date: null,
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const isEdit = !!task;
  const [form, setForm] = useState<TaskPayload>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskPayload, string>>
  >({});

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(task?.id ?? 0);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        assigned_user_id: task.assigned_user_id ?? null,
        due_date: task.due_date ?? null,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [task, isOpen]);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    else if (form.title.length < 3)
      errs.title = 'Title must be at least 3 characters.';
    if (!form.status) errs.status = 'Status is required.';
    if (!form.priority) errs.priority = 'Priority is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: TaskPayload = {
      ...form,
      description: form.description || undefined,
      due_date: form.due_date || null,
      assigned_user_id: form.assigned_user_id || null,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        toast.success('Task updated successfully!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Task created successfully!');
      }
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const msg = axiosErr?.response?.data?.message ?? 'Something went wrong.';
      toast.error(msg);

      const serverErrors = axiosErr?.response?.data?.errors;
      if (serverErrors) {
        const mapped: typeof errors = {};
        for (const [key, msgs] of Object.entries(serverErrors)) {
          mapped[key as keyof TaskPayload] = msgs[0];
        }
        setErrors(mapped);
      }
    }
  };

  const set = <K extends keyof TaskPayload>(key: K, val: TaskPayload[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Task: ${task?.title}` : 'Create New Task'}
      size="md"
      footer={
        <>
          <Button
            id="task-modal-cancel"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            id="task-modal-submit"
            variant="primary"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            loading={isLoading}
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate id="task-form">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <Input
            id="task-title"
            label="Title *"
            placeholder="Enter task title…"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            error={errors.title}
          />

          {/* Description */}
          <Textarea
            id="task-description"
            label="Description"
            placeholder="Describe the task…"
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
          />

          {/* Status + Priority row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}
          >
            <Select
              id="task-status"
              label="Status *"
              options={STATUS_OPTS}
              value={form.status}
              onChange={(e) =>
                set('status', e.target.value as TaskPayload['status'])
              }
              error={errors.status}
            />
            <Select
              id="task-priority"
              label="Priority *"
              options={PRIORITY_OPTS}
              value={form.priority}
              onChange={(e) =>
                set('priority', e.target.value as TaskPayload['priority'])
              }
              error={errors.priority}
            />
          </div>

          {/* Due Date */}
          <Input
            id="task-due-date"
            label="Due Date"
            type="date"
            value={form.due_date ?? ''}
            onChange={(e) => set('due_date', e.target.value || null)}
            style={{ colorScheme: 'dark' }}
          />

          {/* Assigned User ID */}
          <Input
            id="task-assigned-user"
            label="Assignee User ID"
            type="number"
            placeholder="Enter user ID (optional)"
            value={form.assigned_user_id ?? ''}
            onChange={(e) =>
              set(
                'assigned_user_id',
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            helpText="Enter the numeric ID of the user to assign this task to."
          />
        </div>
      </form>
    </Modal>
  );
}
