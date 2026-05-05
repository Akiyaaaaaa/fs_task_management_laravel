'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckSquare2, Trash2, Archive } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useDeleteTask, useBulkUpdateTasks } from '@/hooks/useTasks';
import type { Task } from '@/types';

function TaskSkeleton() {
  return (
    <div
      style={{
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div className="skeleton" style={{ height: '18px', width: '60%' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <div
          className="skeleton"
          style={{ height: '22px', width: '80px', borderRadius: '99px' }}
        />
        <div
          className="skeleton"
          style={{ height: '22px', width: '60px', borderRadius: '99px' }}
        />
      </div>
      <div className="skeleton" style={{ height: '14px', width: '90%' }} />
      <div className="skeleton" style={{ height: '14px', width: '70%' }} />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2,
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <p style={{ fontSize: '13px', color: 'rgb(71,85,105)' }}>
        Page {currentPage} of {lastPage} &mdash; {total} total
      </p>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          id="pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={paginBtnStyle(false, currentPage <= 1)}
        >
          ← Prev
        </button>

        {visiblePages.map((page, i) => {
          const prevPage = visiblePages[i - 1];
          const showEllipsis = prevPage && page - prevPage > 1;
          return (
            <React.Fragment key={page}>
              {showEllipsis && (
                <span
                  style={{
                    color: 'rgb(71,85,105)',
                    padding: '0 4px',
                    alignSelf: 'center',
                  }}
                >
                  …
                </span>
              )}
              <button
                id={`pagination-page-${page}`}
                onClick={() => onPageChange(page)}
                style={paginBtnStyle(page === currentPage, false)}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}

        <button
          id="pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          style={paginBtnStyle(false, currentPage >= lastPage)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function paginBtnStyle(
  active: boolean,
  disabled: boolean,
): React.CSSProperties {
  return {
    padding: '7px 14px',
    fontSize: '13px',
    borderRadius: '8px',
    border: active
      ? '1px solid rgba(99,102,241,0.5)'
      : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
    color: active ? 'rgb(165,180,252)' : 'rgb(148,163,184)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  };
}

// ─── Task List ────────────────────────────────────────────────────────────────

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function TaskList({
  tasks,
  isLoading,
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Task['status']>('completed');

  const deleteTask = useDeleteTask();
  const bulkUpdate = useBulkUpdateTasks();

  // ── Bulk select ─────────────────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(
      selectedIds.size === tasks.length
        ? new Set()
        : new Set(tasks.map((t) => t.id)),
    );
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask.mutateAsync(deletingTask.id);
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
    } finally {
      setDeletingTask(null);
    }
  };

  // ── Bulk update ─────────────────────────────────────────────────────────────
  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdate.mutateAsync({
        task_ids: Array.from(selectedIds),
        status: bulkStatus,
      });
      toast.success(
        `${selectedIds.size} tasks update queued for status: ${bulkStatus.replace('_', ' ')}.`,
      );
      setSelectedIds(new Set());
    } catch {
      toast.error('Bulk update failed. Check if transitions are valid.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          gap: '16px',
          color: 'rgb(71,85,105)',
          textAlign: 'center',
        }}
      >
        <CheckSquare2 size={48} opacity={0.3} />
        <p style={{ fontSize: '16px', fontWeight: 500 }}>No tasks found</p>
        <p style={{ fontSize: '14px' }}>
          Try adjusting your filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          minHeight: '36px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'rgb(100,116,139)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={selectedIds.size === tasks.length && tasks.length > 0}
            onChange={selectAll}
            style={{ accentColor: 'rgb(99,102,241)' }}
            aria-label="Select all tasks"
          />
          Select all
        </label>

        {selectedIds.size > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span style={{ fontSize: '13px', color: 'rgb(165,180,252)' }}>
              {selectedIds.size} selected
            </span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as Task['status'])}
              style={{
                fontSize: '13px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgb(30, 41, 59)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgb(248,250,252)',
                outline: 'none',
                colorScheme: 'dark',
                cursor: 'pointer',
              }}
            >
              <option value="pending" style={{ background: 'rgb(30, 41, 59)' }}>
                Pending
              </option>
              <option
                value="in_progress"
                style={{ background: 'rgb(30, 41, 59)' }}
              >
                In Progress
              </option>
              <option
                value="completed"
                style={{ background: 'rgb(30, 41, 59)' }}
              >
                Completed
              </option>
              <option
                value="cancelled"
                style={{ background: 'rgb(30, 41, 59)' }}
              >
                Cancelled
              </option>
            </select>
            <Button
              id="bulk-update-btn"
              variant="secondary"
              size="sm"
              leftIcon={<Archive size={14} />}
              loading={bulkUpdate.isPending}
              onClick={handleBulkUpdate}
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Task cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            selected={selectedIds.has(task.id)}
            onSelect={toggleSelect}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        total={total}
        perPage={perPage}
        onPageChange={onPageChange}
      />

      {/* Edit modal */}
      <TaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button
              id="confirm-delete-btn"
              variant="danger"
              loading={deleteTask.isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p style={{ color: 'rgb(148,163,184)', fontSize: '14px' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'rgb(248,250,252)' }}>
            &ldquo;{deletingTask?.title}&rdquo;
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
