'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useEcho } from '@/hooks/useEcho';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import type { TaskComment } from '@/types';

function CommentBubble({
  comment,
  isOwn,
}: {
  comment: TaskComment;
  isOwn: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        animation: 'slideInUp 0.3s ease',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isOwn
            ? 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))'
            : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}
      >
        {comment.user ? getInitials(comment.user.name) : '?'}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: isOwn ? 'rgb(165,180,252)' : 'rgb(148,163,184)',
            }}
          >
            {comment.user?.name ?? 'Unknown'}
          </span>
          <span style={{ fontSize: '11px', color: 'rgb(51,65,85)' }}>
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            background: isOwn
              ? 'rgba(99,102,241,0.15)'
              : 'rgba(255,255,255,0.05)',
            border: isOwn
              ? '1px solid rgba(99,102,241,0.25)'
              : '1px solid rgba(255,255,255,0.08)',
            fontSize: '14px',
            color: 'rgb(226,232,240)',
            lineHeight: '1.5',
          }}
        >
          {comment.comment}
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  taskId: number;
  initialComments: TaskComment[];
}

export function CommentSection({
  taskId,
  initialComments,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>(initialComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Stable callbacks untuk useEcho (tidak pernah berubah identitas) ──

  const handleNewComment = useCallback((c: TaskComment) => {
    console.log('[CommentSection] handleNewComment triggered with:', c);
    setComments((prev) => {
      // Deduplicate: komentar dari POST response mungkin datang duluan
      if (prev.some((p) => p.id === c.id)) {
        console.log('[CommentSection] Comment deduplicated (ignored):', c.id);
        return prev;
      }
      console.log('[CommentSection] Appending new comment:', c.id);
      return [...prev, c];
    });
  }, []);

  const handleTypingReceived = useCallback((userName: string) => {
    console.log(
      '[CommentSection] handleTypingReceived triggered for:',
      userName,
    );
    setTypingUser(userName);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      console.log('[CommentSection] Clearing typing indicator');
      setTypingUser(null);
    }, 2000);
  }, []);

  // ── Hook Echo: satu channel untuk CommentPosted + typing whisper ──

  const { whisperTyping } = useEcho({
    taskId,
    onComment: handleNewComment,
    onTyping: handleTypingReceived,
  });

  // ── Auto-scroll saat ada komentar baru atau ada yang mengetik ──

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length, typingUser]);

  // ── Typing whisper sender ──

  const handleTyping = useCallback(() => {
    whisperTyping(user?.name || 'Someone');
  }, [whisperTyping, user?.name]);

  // ── Submit komentar ──

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post<{ data: TaskComment }>(
        `/tasks/${taskId}/comments`,
        { comment: text.trim() },
      );
      handleNewComment(data.data);
      setText('');
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <MessageSquare size={16} color="rgb(99,102,241)" />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgb(148,163,184)',
          }}
        >
          Comments ({comments.length})
        </span>
      </div>

      {/* Comment list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '4px',
          marginBottom: '20px',
        }}
      >
        {comments.length === 0 && (
          <p
            style={{
              fontSize: '14px',
              color: 'rgb(51,65,85)',
              textAlign: 'center',
              padding: '24px 0',
            }}
          >
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.map((c) => (
          <CommentBubble
            key={c.id}
            comment={c}
            isOwn={c.user_id === user?.id}
          />
        ))}
        {/* Typing Indicator */}
        {typingUser && (
          <div
            style={{
              fontSize: '12px',
              color: 'rgb(148,163,184)',
              fontStyle: 'italic',
              paddingLeft: '42px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {typingUser} is typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
            marginBottom: '2px',
          }}
        >
          {user ? getInitials(user.name) : 'U'}
        </div>

        {/* Textarea */}
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            id="comment-input"
            placeholder="Write a comment… (Enter to send, Shift+Enter for newline)"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{
              width: '100%',
              padding: '10px 44px 10px 14px',
              fontSize: '14px',
              color: 'rgb(248,250,252)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(99,102,241,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {/* Send button inside textarea */}
          <button
            id="comment-submit-btn"
            onClick={submit}
            disabled={!text.trim() || sending}
            aria-label="Send comment"
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background:
                text.trim() && !sending
                  ? 'rgb(99,102,241)'
                  : 'rgba(255,255,255,0.08)',
              border: 'none',
              cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: text.trim() && !sending ? 'white' : 'rgb(71,85,105)',
              transition: 'all 0.2s',
            }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
