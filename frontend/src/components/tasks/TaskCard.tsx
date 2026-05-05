'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  User,
  Paperclip,
  MessageSquare,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  selected?: boolean;
  onSelect?: (id: number) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  selected,
  onSelect,
}: TaskCardProps) {
  const isDueSoon =
    task.due_date &&
    new Date(task.due_date).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
    task.status !== 'completed';

  return (
    <article
      style={{
        background: selected
          ? 'rgba(99,102,241,0.08)'
          : 'rgba(255,255,255,0.03)',
        border: selected
          ? '1px solid rgba(99,102,241,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '20px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }
      }}
    >
      {/* Priority accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background:
            task.priority === 'high'
              ? 'rgb(239,68,68)'
              : task.priority === 'medium'
                ? 'rgb(245,158,11)'
                : 'rgb(34,197,94)',
          borderRadius: '14px 0 0 14px',
        }}
      />

      {/* Top row: checkbox + badges + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {/* Checkbox for bulk select */}
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(task.id)}
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: '3px',
              accentColor: 'rgb(99,102,241)',
              cursor: 'pointer',
            }}
            aria-label={`Select task ${task.title}`}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <Link
            href={`/tasks/${task.id}`}
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'rgb(248,250,252)',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {task.title}
          </Link>

          {/* Badges row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{ display: 'flex', gap: '6px', flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id={`edit-task-${task.id}`}
            onClick={() => onEdit(task)}
            title="Edit task"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'rgb(148,163,184)',
              display: 'flex',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
              e.currentTarget.style.color = 'rgb(165,180,252)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgb(148,163,184)';
            }}
          >
            <Edit2 size={14} />
          </button>
          <button
            id={`delete-task-${task.id}`}
            onClick={() => onDelete(task)}
            title="Delete task"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'rgb(148,163,184)',
              display: 'flex',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.color = 'rgb(239,68,68)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgb(148,163,184)';
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description snippet */}
      {task.description && (
        <p
          style={{
            fontSize: '13px',
            color: 'rgb(100,116,139)',
            marginBottom: '14px',
            lineHeight: '1.5',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.description}
        </p>
      )}

      {/* Footer: metadata */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: 'rgb(71,85,105)',
        }}
      >
        {/* Due date */}
        {task.due_date && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isDueSoon ? 'rgb(249,115,22)' : 'rgb(71,85,105)',
            }}
          >
            <Calendar size={12} />
            {formatDate(task.due_date)}
          </span>
        )}

        {/* Assignee */}
        {task.assignee && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} />
            {task.assignee.name}
          </span>
        )}

        {/* Attachments count */}
        {task.attachments && task.attachments.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Paperclip size={12} />
            {task.attachments.length}
          </span>
        )}

        {/* Comments count */}
        {task.comments && task.comments.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={12} />
            {task.comments.length}
          </span>
        )}

        {/* Created time */}
        <span style={{ marginLeft: 'auto' }}>
          {formatRelativeTime(task.created_at)}
        </span>
      </div>
    </article>
  );
}
