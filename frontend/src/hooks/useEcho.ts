import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEcho } from '@/lib/echo';
import type { Task, TaskComment } from '@/types';

interface UseEchoOptions {
  taskId?: number | null;
  userId?: number | null;
  onComment?: (comment: TaskComment) => void;
  onTyping?: (userName: string) => void;
  onExportReady?: (data: { download_url: string; filename: string }) => void;
}

export function useEcho({
  taskId,
  userId,
  onComment,
  onTyping,
  onExportReady,
}: UseEchoOptions = {}) {
  const qc = useQueryClient();

  // ── TaskStatusUpdated per user ──────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null;

    (async () => {
      const echo = await getEcho();
      if (!echo || !mounted) return;

      channel = echo.private(`tasks.${userId}`);
      channel.listen('TaskStatusUpdated', (e: { task: Task }) => {
        qc.invalidateQueries({ queryKey: ['tasks'] });
        qc.setQueryData(['tasks', e.task.id], e.task);
      });

      channel.listen('.ExportCompleted', (e: { download_url: string; filename: string }) => {
        if (mounted && onExportReadyRef.current) {
          onExportReadyRef.current(e);
        }
      });
    })();

    return () => {
      mounted = false;
      channel?.stopListening('TaskStatusUpdated');
      channel?.stopListening('.ExportCompleted');
    };
  }, [userId, qc]);

  // ── Callback refs: selalu fresh, tanpa re-subscribe ─────────
  const onCommentRef = useRef(onComment);
  const onTypingRef = useRef(onTyping);
  const onExportReadyRef = useRef(onExportReady);
  
  // Sync refs on render
  onCommentRef.current = onComment;
  onTypingRef.current = onTyping;
  onExportReadyRef.current = onExportReady;

  // ── Comment channel: subscribe + whisper, satu instance ─────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!taskId) return;
    let mounted = true;

    (async () => {
      const echo = await getEcho();
      if (!echo || !mounted) return;

      const ch = echo.private(`tasks.${taskId}.comments`);
      channelRef.current = ch;

      ch.listen('.CommentPosted', (e: any) => {
        console.log('Full Event Payload:', e);
        // Sometimes payload is wrapped in `e.comment`, sometimes it's just `e` depending on backend
        const payload = e.comment ? e.comment : e;
        if (mounted) onCommentRef.current?.(payload);
      });

      ch.listenForWhisper('typing', (e: { user: string }) => {
        if (mounted) onTypingRef.current?.(e.user);
      });
    })();

    return () => {
      mounted = false;
      if (channelRef.current) {
        channelRef.current.stopListening('CommentPosted');
        channelRef.current = null;
      }
    };
    // taskId saja — refs tidak menyebabkan re-subscribe
  }, [taskId]);

  const whisperTyping = useCallback((userName: string) => {
    channelRef.current?.whisper('typing', { user: userName });
  }, []);

  return { whisperTyping };
}
