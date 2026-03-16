/**
 * Task Types Contract
 * Feature: 005-assign-task
 *
 * These types define the contract between the database, service layer,
 * and UI components for the task/mission functionality.
 */

// ============================================================================
// Priority Types
// ============================================================================

export const TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente'
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'var(--color-sage)',
  normal: 'var(--color-navy)',
  high: 'var(--color-gold)',
  urgent: 'var(--color-rose)'
};

// ============================================================================
// Status Types
// ============================================================================

export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé'
};

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Database row type for tasks table
 */
export interface Task {
  id: string;
  user_id: string;
  staff_member_id: string | null;
  title: string;
  description: string | null;
  due_date: string;  // ISO date string YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended type with staff member info for display
 */
export interface TaskWithStaff extends Task {
  staff_member: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
  } | null;
}

/**
 * Insert type for creating new tasks
 * id, user_id, and timestamps are auto-generated
 */
export interface TaskInsert {
  staff_member_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  notes?: string | null;
}

/**
 * Update type for modifying existing tasks
 * All fields optional
 */
export interface TaskUpdate {
  staff_member_id?: string | null;
  title?: string;
  description?: string | null;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  notes?: string | null;
}

/**
 * Filter type for querying tasks
 */
export interface TaskFilters {
  staffMemberId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// ============================================================================
// Service Types
// ============================================================================

/**
 * Standard service result type
 */
export interface ServiceResult<T = void> {
  data?: T;
  error: string | null;
}

/**
 * Parameters for getTasks query
 */
export interface GetTasksParams {
  filters?: TaskFilters;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed') return false;
  const today = new Date().toISOString().split('T')[0];
  return task.due_date < today;
}

/**
 * Check if a task is urgent (due today)
 */
export function isTaskUrgent(task: Task): boolean {
  if (task.status === 'completed') return false;
  const today = new Date().toISOString().split('T')[0];
  return task.due_date === today;
}

/**
 * Calculate days until due date
 * Returns negative number if overdue
 */
export function getDaysUntilDue(task: Task): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
