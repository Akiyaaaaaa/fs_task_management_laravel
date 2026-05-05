'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { TaskFilters } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in_progress', label: '🔄 In Progress' },
  { value: 'completed', label: '✅ Completed' },
  { value: 'cancelled', label: '❌ Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🔴 High' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onSearch: (search: string) => void;
  searchValue: string;
  total?: number;
}

export function TaskFiltersBar({
  filters,
  onChange,
  onSearch,
  searchValue,
  total,
}: TaskFiltersProps) {
  const hasActiveFilters = filters.status || filters.priority || searchValue;

  const clearAll = () => {
    onChange({ ...filters, status: '', priority: '', page: 1 });
    onSearch('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Search + filters row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgb(100,116,139)',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            <Search size={16} />
          </span>
          <input
            id="task-search"
            type="search"
            placeholder="Search tasks…"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 16px 9px 38px',
              fontSize: '14px',
              color: 'rgb(248,250,252)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(99,102,241,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ minWidth: '160px' }}>
          <Select
            id="filter-status"
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as TaskFilters['status'],
                page: 1,
              })
            }
            aria-label="Filter by status"
          />
        </div>

        {/* Priority filter */}
        <div style={{ minWidth: '160px' }}>
          <Select
            id="filter-priority"
            options={PRIORITY_OPTIONS}
            value={filters.priority ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                priority: e.target.value as TaskFilters['priority'],
                page: 1,
              })
            }
            aria-label="Filter by priority"
          />
        </div>

        {/* Sort */}
        <div style={{ minWidth: '150px' }}>
          <Select
            id="filter-sort"
            options={SORT_OPTIONS}
            value={filters.sort_by ?? 'created_at'}
            onChange={(e) =>
              onChange({
                ...filters,
                sort_by: e.target.value as TaskFilters['sort_by'],
                page: 1,
              })
            }
            aria-label="Sort tasks by"
          />
        </div>

        {/* Sort direction toggle */}
        <button
          id="filter-sort-dir"
          onClick={() =>
            onChange({
              ...filters,
              sort_dir: filters.sort_dir === 'asc' ? 'desc' : 'asc',
              page: 1,
            })
          }
          title={`Sort ${filters.sort_dir === 'asc' ? 'descending' : 'ascending'}`}
          style={{
            padding: '9px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            cursor: 'pointer',
            color: 'rgb(148,163,184)',
            fontSize: '14px',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
            e.currentTarget.style.color = 'rgb(165,180,252)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'rgb(148,163,184)';
          }}
        >
          {filters.sort_dir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            id="clear-filters-btn"
            variant="ghost"
            size="sm"
            leftIcon={<X size={14} />}
            onClick={clearAll}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {total !== undefined && (
        <p style={{ fontSize: '13px', color: 'rgb(71,85,105)', margin: 0 }}>
          {total === 0
            ? 'No tasks found'
            : `Showing ${total} task${total !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
}
