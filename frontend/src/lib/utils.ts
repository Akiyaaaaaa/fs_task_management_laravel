import { clsx, type ClassValue } from 'clsx';

/**
 * Merge Tailwind classes safely (fallback without clsx if not installed).
 */
export function cn(...inputs: ClassValue[]) {
  try {
    return clsx(inputs);
  } catch {
    return inputs.filter(Boolean).join(' ');
  }
}

/**
 * Format a file size in bytes to a human-readable string.
 * e.g. 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format an ISO date string to a short locale string.
 * e.g. "2025-12-31" → "Dec 31, 2025"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format an ISO datetime string to a relative time.
 * e.g. "2 hours ago"
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(dateStr);
}

/**
 * Map a TaskStatus to a display label.
 */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status] ?? status;
}

/**
 * Map a TaskPriority to a display label.
 */
export function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low:    'Low',
    medium: 'Medium',
    high:   'High',
  };
  return map[priority] ?? priority;
}

/**
 * Get initials from a full name.
 * e.g. "John Doe" → "JD"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce a function call.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
