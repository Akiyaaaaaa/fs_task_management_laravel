'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit2,
  Paperclip,
  MessageSquare,
  Info,
} from 'lucide-react';
import { useTask } from '@/hooks/useTasks';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import dynamic from 'next/dynamic';
import { AttachmentList } from '@/components/tasks/AttachmentList';
import { CommentSection } from '@/components/comments/CommentSection';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { TaskAttachment } from '@/types';

const TaskModal = dynamic(() => import('@/components/tasks/TaskModal').then((m) => m.TaskModal), { ssr: false });
const DropZone = dynamic(() => import('@/components/upload/DropZone').then((m) => m.DropZone), { ssr: false });

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Tab = 'details' | 'attachments' | 'comments';

function TabBar({
  active,
  onChange,
  commentCount,
  attachmentCount,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  commentCount: number;
  attachmentCount: number;
}) {
  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'details',     label: 'Details',     icon: <Info size={15} /> },
    { key: 'attachments', label: 'Attachments', icon: <Paperclip size={15} />,    count: attachmentCount },
    { key: 'comments',    label: 'Comments',    icon: <MessageSquare size={15} />, count: commentCount },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '24px',
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          id={`tab-${t.key}`}
          onClick={() => onChange(t.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '12px 18px',
            fontSize: '14px',
            fontWeight: active === t.key ? 600 : 400,
            color: active === t.key ? 'rgb(165,180,252)' : 'rgb(100,116,139)',
            background: 'none',
            border: 'none',
            borderBottom: active === t.key
              ? '2px solid rgb(99,102,241)'
              : '2px solid transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginBottom: '-1px',
            transition: 'all 0.15s',
          }}
        >
          {t.icon}
          {t.label}
          {t.count !== undefined && t.count > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '99px',
                background: active === t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)',
                color: active === t.key ? 'rgb(165,180,252)' : 'rgb(100,116,139)',
              }}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [editOpen, setEditOpen] = useState(false);
  const [localAttachments, setLocalAttachments] = useState<TaskAttachment[] | null>(null);

  const { data: task, isLoading, isError, refetch } = useTask(id);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: 'rgb(99,102,241)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (isError || !task) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'rgb(239,68,68)',
          fontSize: '15px',
        }}
      >
        Task not found or failed to load.{' '}
        <Link href="/tasks" style={{ color: 'rgb(99,102,241)', textDecoration: 'none' }}>
          ← Back to tasks
        </Link>
      </div>
    );
  }

  const attachments = localAttachments ?? task.attachments ?? [];
  const comments = task.comments ?? [];

  const handleUploadComplete = () => {
    // Refetch the task to get the updated attachments list
    refetch().then((result) => {
      if (result.data) setLocalAttachments(result.data.attachments ?? null);
    });
  };

  const handleAttachmentDeleted = (deletedId: number) => {
    setLocalAttachments((prev) =>
      (prev ?? attachments).filter((a) => a.id !== deletedId),
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back + Edit header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          href="/tasks"
          id="back-to-tasks-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgb(100,116,139)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(165,180,252)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(100,116,139)'; }}
        >
          <ArrowLeft size={16} />
          Back to Tasks
        </Link>

        <Button
          id="edit-task-detail-btn"
          variant="secondary"
          size="sm"
          leftIcon={<Edit2 size={14} />}
          onClick={() => setEditOpen(true)}
        >
          Edit Task
        </Button>
      </div>

      {/* Task header card */}
      <div
        className="glass"
        style={{ padding: '28px', marginBottom: '24px' }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgb(248,250,252)',
            marginBottom: '14px',
            lineHeight: 1.3,
          }}
        >
          {task.title}
        </h1>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Meta grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {task.due_date && (
            <MetaItem icon={<Calendar size={14} />} label="Due Date" value={formatDate(task.due_date)} />
          )}
          {task.assignee && (
            <MetaItem icon={<User size={14} />} label="Assignee" value={task.assignee.name} />
          )}
          {task.creator && (
            <MetaItem icon={<User size={14} />} label="Created By" value={task.creator.name} />
          )}
          <MetaItem
            icon={<Clock size={14} />}
            label="Last Updated"
            value={formatRelativeTime(task.updated_at)}
          />
        </div>
      </div>

      {/* Tab content */}
      <div
        className="glass"
        style={{ padding: '24px' }}
      >
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          attachmentCount={attachments.length}
          commentCount={comments.length}
        />

        {/* Details tab */}
        {activeTab === 'details' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {task.description ? (
              <p style={{ fontSize: '15px', color: 'rgb(148,163,184)', lineHeight: 1.7 }}>
                {task.description}
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: 'rgb(51,65,85)', fontStyle: 'italic' }}>
                No description provided.
              </p>
            )}
          </div>
        )}

        {/* Attachments tab */}
        {activeTab === 'attachments' && (
          <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <DropZone
              taskId={task.id}
              onUploadComplete={handleUploadComplete}
            />
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <AttachmentList
                attachments={attachments}
                onDeleted={handleAttachmentDeleted}
              />
            </div>
          </div>
        )}

        {/* Comments tab */}
        {activeTab === 'comments' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <CommentSection taskId={task.id} initialComments={comments} />
          </div>
        )}
      </div>

      {/* Edit modal */}
      <TaskModal isOpen={editOpen} onClose={() => setEditOpen(false)} task={task} />
    </div>
  );
}

// ─── Meta Item ────────────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11px',
          color: 'rgb(71,85,105)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px',
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(226,232,240)' }}>
        {value}
      </div>
    </div>
  );
}
