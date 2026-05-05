'use client';

import React from 'react';
import Image from 'next/image';
import { Download, Trash2, FileImage, File } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { formatFileSize, formatRelativeTime } from '@/lib/utils';
import type { TaskAttachment } from '@/types';

interface AttachmentListProps {
  attachments: TaskAttachment[];
  onDeleted?: (id: number) => void;
}

export function AttachmentList({
  attachments,
  onDeleted,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <p
        style={{
          fontSize: '14px',
          color: 'rgb(71,85,105)',
          textAlign: 'center',
          padding: '24px 0',
        }}
      >
        No attachments yet. Use the drop zone above to upload files.
      </p>
    );
  }

  const handleDelete = async (attachment: TaskAttachment) => {
    try {
      await api.delete(`/attachments/${attachment.id}`);
      toast.success(`"${attachment.file_name}" deleted.`);
      onDeleted?.(attachment.id);
    } catch {
      toast.error('Failed to delete attachment.');
    }
  };

  const handleDownload = (attachment: TaskAttachment) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/api';
    window.open(`${baseUrl}/attachments/${attachment.id}/download`, '_blank');
  };

  const isImage = (mime: string) => mime.startsWith('image/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {attachments.map((att) => (
        <div
          key={att.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          {/* File type icon / Thumbnail */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99,102,241,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgb(165,180,252)',
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {isImage(att.mime_type) && att.thumbnail_path ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${att.thumbnail_path}`}
                alt={att.file_name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="36px"
              />
            ) : isImage(att.mime_type) ? (
              <FileImage size={18} />
            ) : (
              <File size={18} />
            )}
          </div>

          {/* File info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgb(248,250,252)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
              }}
            >
              {att.file_name}
            </p>
            <p style={{ fontSize: '11px', color: 'rgb(71,85,105)' }}>
              {formatFileSize(att.file_size)} &middot;{' '}
              {formatRelativeTime(att.uploaded_at)}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              id={`download-att-${att.id}`}
              onClick={() => handleDownload(att)}
              title="Download"
              style={attBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                e.currentTarget.style.color = 'rgb(165,180,252)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, attBtnStyle);
              }}
            >
              <Download size={14} />
            </button>
            <button
              id={`delete-att-${att.id}`}
              onClick={() => handleDelete(att)}
              title="Delete"
              style={attBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                e.currentTarget.style.color = 'rgb(239,68,68)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, attBtnStyle);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const attBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '6px',
  cursor: 'pointer',
  color: 'rgb(148,163,184)',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
};
