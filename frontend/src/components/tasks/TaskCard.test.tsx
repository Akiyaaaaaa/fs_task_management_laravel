import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import { Task } from '@/types';

vi.mock('lucide-react', () => ({
  Clock: () => <div data-testid="icon-clock" />,
  MessageSquare: () => <div data-testid="icon-message" />,
  Paperclip: () => <div data-testid="icon-paperclip" />,
  MoreHorizontal: () => <div data-testid="icon-more" />,
  Edit2: () => <div data-testid="icon-edit" />,
  Trash2: () => <div data-testid="icon-trash" />,
}));

const mockTask: Task = {
  id: 1,
  title: 'Test Task Rendering',
  description: 'This is a test task',
  status: 'pending',
  priority: 'high',
  assigned_user_id: 2,
  created_by: 1,
  due_date: '2026-12-31T00:00:00Z',
  created_at: '2026-05-04T10:00:00Z',
  updated_at: '2026-05-04T10:00:00Z',
  assignee: { id: 2, name: 'John Doe', email: 'john@example.com' },
  comments: [],
  attachments: [],
};

describe('TaskCard Component', () => {
  it('renders task data correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onClick={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText('Test Task Rendering')).toBeInTheDocument();

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit prop when edit action is clicked', () => {
    const handleEdit = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onClick={() => {}}
        onEdit={handleEdit}
        onDelete={() => {}}
      />,
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });
});
