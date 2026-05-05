'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { formatFileSize } from '@/lib/utils';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

interface DropZoneProps {
  taskId: number;
  onUploadComplete?: () => void;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
}

export function DropZone({
  taskId,
  onUploadComplete,
  maxSizeMB = 10,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
    'text/plain': ['.txt'],
    'application/zip': ['.zip'],
  },
}: DropZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const updateFile = useCallback((id: string, patch: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const uploadFile = useCallback(
    async (uploadEntry: UploadFile) => {
      const formData = new FormData();
      formData.append('file', uploadEntry.file);

      updateFile(uploadEntry.id, { status: 'uploading', progress: 0 });

      try {
        await api.post(`/tasks/${taskId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            const progress = event.total
              ? Math.round((event.loaded * 100) / event.total)
              : 0;
            updateFile(uploadEntry.id, { progress });
          },
        });

        updateFile(uploadEntry.id, { status: 'done', progress: 100 });
        toast.success(`"${uploadEntry.file.name}" uploaded successfully.`);
        onUploadComplete?.();
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        };
        const msg =
          axiosErr?.response?.data?.message ??
          Object.values(axiosErr?.response?.data?.errors ?? {})?.[0]?.[0] ??
          'Upload failed.';
        updateFile(uploadEntry.id, { status: 'error', errorMsg: msg });
        toast.error(`Upload failed: ${msg}`);
      }
    },
    [taskId, updateFile, onUploadComplete],
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: import('react-dropzone').FileRejection[]) => {
      rejected.forEach((r) => {
        const code = r.errors[0]?.code;
        const msg =
          code === 'file-too-large'
            ? `File too large (max ${maxSizeMB} MB)`
            : code === 'file-invalid-type'
              ? 'File type not allowed'
              : 'File rejected';
        toast.error(`${r.file.name}: ${msg}`);
      });

      // Queue accepted files and kick off uploads
      const newEntries: UploadFile[] = accepted.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending',
      }));

      setFiles((prev) => [...prev, ...newEntries]);
      newEntries.forEach(uploadFile);
    },
    [uploadFile, maxSizeMB],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div>
      {/* Drop zone area */}
      <div
        {...getRootProps()}
        id="dropzone-area"
        style={{
          border: `2px dashed ${isDragActive ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '14px',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive
            ? 'rgba(99,102,241,0.08)'
            : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          boxShadow: isDragActive ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }
        }}
      >
        <input {...getInputProps()} aria-label="File upload input" />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: isDragActive
              ? 'rgba(99,102,241,0.2)'
              : 'rgba(255,255,255,0.06)',
            color: isDragActive ? 'rgb(165,180,252)' : 'rgb(100,116,139)',
            marginBottom: '16px',
            transition: 'all 0.2s',
          }}
        >
          <Upload size={22} />
        </div>

        <p
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: isDragActive ? 'rgb(165,180,252)' : 'rgb(148,163,184)',
            marginBottom: '6px',
          }}
        >
          {isDragActive ? 'Drop files here…' : 'Drag & drop files here'}
        </p>
        <p style={{ fontSize: '13px', color: 'rgb(71,85,105)' }}>
          or{' '}
          <span style={{ color: 'rgb(99,102,241)', fontWeight: 500 }}>
            browse
          </span>{' '}
          to upload
        </p>
        <p
          style={{ fontSize: '12px', color: 'rgb(51,65,85)', marginTop: '8px' }}
        >
          Max {maxSizeMB} MB per file &middot; Images, PDF, DOCX, TXT, ZIP
        </p>
      </div>

      {/* Upload queue */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {files.map((f) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border:
                  f.status === 'error'
                    ? '1px solid rgba(239,68,68,0.3)'
                    : f.status === 'done'
                      ? '1px solid rgba(34,197,94,0.25)'
                      : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* File icon */}
              <div style={{ color: 'rgb(100,116,139)', flexShrink: 0 }}>
                <File size={18} />
              </div>

              {/* File info + progress */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgb(248,250,252)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '240px',
                    }}
                  >
                    {f.file.name}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgb(71,85,105)',
                      flexShrink: 0,
                    }}
                  >
                    {formatFileSize(f.file.size)}
                  </span>
                </div>

                {/* Progress bar */}
                {f.status === 'uploading' && (
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {f.status === 'error' && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgb(239,68,68)',
                      marginTop: '2px',
                    }}
                  >
                    {f.errorMsg}
                  </p>
                )}

                {/* Done label */}
                {f.status === 'done' && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'rgb(34,197,94)',
                      marginTop: '2px',
                    }}
                  >
                    Upload complete
                  </p>
                )}
              </div>

              {/* Status icon */}
              <div style={{ flexShrink: 0 }}>
                {f.status === 'done' && (
                  <CheckCircle size={16} color="rgb(34,197,94)" />
                )}
                {f.status === 'error' && (
                  <AlertCircle size={16} color="rgb(239,68,68)" />
                )}
                {(f.status === 'pending' || f.status === 'uploading') && (
                  <span style={{ fontSize: '12px', color: 'rgb(100,116,139)' }}>
                    {f.progress}%
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFile(f.id)}
                disabled={f.status === 'uploading'}
                aria-label={`Remove ${f.file.name}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: f.status === 'uploading' ? 'not-allowed' : 'pointer',
                  color: 'rgb(71,85,105)',
                  display: 'flex',
                  padding: '2px',
                  opacity: f.status === 'uploading' ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(239,68,68)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgb(71,85,105)';
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
