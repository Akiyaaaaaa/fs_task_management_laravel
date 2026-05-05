import React from 'react';
import { statusLabel, priorityLabel } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'priority' | 'default';
  status?: TaskStatus;
  priority?: TaskPriority;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const statusColors: Record<TaskStatus, React.CSSProperties> = {
  pending: {
    background: 'rgba(245,158,11,0.15)',
    color: 'rgb(245,158,11)',
    border: '1px solid rgba(245,158,11,0.3)',
  },
  in_progress: {
    background: 'rgba(99,102,241,0.15)',
    color: 'rgb(165,180,252)',
    border: '1px solid rgba(99,102,241,0.3)',
  },
  completed: {
    background: 'rgba(34,197,94,0.15)',
    color: 'rgb(34,197,94)',
    border: '1px solid rgba(34,197,94,0.3)',
  },
  cancelled: {
    background: 'rgba(239,68,68,0.15)',
    color: 'rgb(239,68,68)',
    border: '1px solid rgba(239,68,68,0.3)',
  },
};

const priorityColors: Record<TaskPriority, React.CSSProperties> = {
  low: {
    background: 'rgba(34,197,94,0.12)',
    color: 'rgb(34,197,94)',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  medium: {
    background: 'rgba(245,158,11,0.12)',
    color: 'rgb(245,158,11)',
    border: '1px solid rgba(245,158,11,0.25)',
  },
  high: {
    background: 'rgba(239,68,68,0.12)',
    color: 'rgb(239,68,68)',
    border: '1px solid rgba(239,68,68,0.25)',
  },
};

export function Badge({
  children,
  variant = 'default',
  status,
  priority,
  size = 'md',
  dot,
}: BadgeProps) {
  let colorStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgb(148,163,184)',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  if (variant === 'status' && status) colorStyle = statusColors[status];
  if (variant === 'priority' && priority) colorStyle = priorityColors[priority];

  const dotColor =
    variant === 'status' && status
      ? (colorStyle as { color: string }).color
      : variant === 'priority' && priority
        ? (colorStyle as { color: string }).color
        : 'rgb(148,163,184)';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 500,
        borderRadius: '99px',
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        ...colorStyle,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="status" status={status} dot>
      {statusLabel(status)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant="priority" priority={priority} dot>
      {priorityLabel(priority)}
    </Badge>
  );
}
