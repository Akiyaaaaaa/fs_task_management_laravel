
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'user';


export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}


export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_user_id: number | null;
  created_by: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  creator?: Pick<User, 'id' | 'name' | 'email'>;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}


export interface TaskAttachment {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  thumbnail_path: string | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}


export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name'>;
}


/** Laravel paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

/** Generic single-item response */
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

/** Auth response from POST /api/auth/login */
export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
}


export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  assigned_user_id?: number | '';
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'status' | 'title';
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}


export interface LoginPayload {
  email: string;
  password: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_user_id?: number | null;
  due_date?: string | null;
}
