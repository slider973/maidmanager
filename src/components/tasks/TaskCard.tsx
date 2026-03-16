/**
 * TaskCard Component
 * Displays a single task/mission with staff info and status
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import {
  POSITION_LABELS,
  type StaffPosition,
} from '../../lib/types/database'
import {
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  isTaskOverdue,
  isTaskUrgent,
  getDaysUntilDue,
  type TaskWithStaff,
  type TaskStatus,
} from '../../lib/types/task.types'

interface TaskCardProps {
  task: TaskWithStaff
  onEdit?: (task: TaskWithStaff) => void
  onDelete?: (task: TaskWithStaff) => void
  onStatusChange?: (task: TaskWithStaff, status: TaskStatus) => void
}

export const TaskCard: Component<TaskCardProps> = (props) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getPositionLabel = (position: string): string => {
    return POSITION_LABELS[position as StaffPosition] || position
  }

  const getCardClass = (): string => {
    const classes = ['task-card']
    if (props.task.status === 'completed') {
      classes.push('task-card-completed')
    } else if (isTaskOverdue(props.task)) {
      classes.push('task-card-overdue')
    } else if (isTaskUrgent(props.task)) {
      classes.push('task-card-urgent')
    }
    return classes.join(' ')
  }

  const getPriorityClass = (): string => {
    return `task-priority task-priority-${props.task.priority}`
  }

  const getStatusClass = (): string => {
    return `task-status task-status-${props.task.status}`
  }

  const getDueDateLabel = (): string => {
    const days = getDaysUntilDue(props.task)
    if (days < 0) return `En retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Demain'
    return `Dans ${days} jours`
  }

  const isCompleted = () => props.task.status === 'completed'

  return (
    <div class={getCardClass()}>
      <div class="task-card-header">
        <div class="task-card-info">
          {/* Title */}
          <h3 class="task-card-title">{props.task.title}</h3>

          {/* Due date */}
          <div class="task-card-due-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(props.task.due_date)}</span>
            <Show when={!isCompleted()}>
              <span class="task-due-label">({getDueDateLabel()})</span>
            </Show>
          </div>

          {/* Description */}
          <Show when={props.task.description}>
            <p class="task-card-description">{props.task.description}</p>
          </Show>
        </div>

        {/* Badges */}
        <div class="task-card-badges">
          {/* Overdue badge */}
          <Show when={!isCompleted() && isTaskOverdue(props.task)}>
            <span class="task-badge task-badge-overdue">En retard</span>
          </Show>

          {/* Urgent badge */}
          <Show when={!isCompleted() && isTaskUrgent(props.task)}>
            <span class="task-badge task-badge-urgent">Urgent</span>
          </Show>

          {/* Priority badge */}
          <span class={getPriorityClass()}>
            {PRIORITY_LABELS[props.task.priority]}
          </span>

          {/* Status badge */}
          <span class={getStatusClass()}>
            {TASK_STATUS_LABELS[props.task.status]}
          </span>
        </div>
      </div>

      {/* Staff member info */}
      <div class="task-card-staff">
        <Show
          when={props.task.staff_member}
          fallback={<span class="task-no-staff">Membre supprimé</span>}
        >
          <div class="task-staff-avatar">
            {props.task.staff_member!.first_name.charAt(0)}
            {props.task.staff_member!.last_name.charAt(0)}
          </div>
          <div class="task-staff-info">
            <span class="task-staff-name">
              {props.task.staff_member!.first_name} {props.task.staff_member!.last_name}
            </span>
            <span class="task-staff-position">
              {getPositionLabel(props.task.staff_member!.position)}
            </span>
          </div>
        </Show>
      </div>

      {/* Notes */}
      <Show when={props.task.notes}>
        <div class="task-card-notes">
          <p>{props.task.notes}</p>
        </div>
      </Show>

      {/* Action buttons */}
      <div class="task-card-actions">
        <Show when={props.onEdit}>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            onClick={() => props.onEdit?.(props.task)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
        </Show>

        <Show when={props.onStatusChange && props.task.status !== 'completed'}>
          <Show when={props.task.status === 'pending'}>
            <button
              type="button"
              class="btn btn-sm btn-info"
              onClick={() => props.onStatusChange?.(props.task, 'in_progress')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              En cours
            </button>
          </Show>

          <button
            type="button"
            class="btn btn-sm btn-success"
            onClick={() => props.onStatusChange?.(props.task, 'completed')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            Terminé
          </button>
        </Show>

        <Show when={props.onStatusChange && props.task.status === 'completed'}>
          <button
            type="button"
            class="btn btn-sm btn-warning"
            onClick={() => props.onStatusChange?.(props.task, 'pending')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 2v6h6" />
              <path d="M3 8a9 9 0 019-9 9.08 9.08 0 016 2.3" />
            </svg>
            Réouvrir
          </button>
        </Show>

        <Show when={props.onDelete}>
          <button
            type="button"
            class="btn btn-sm btn-danger"
            onClick={() => props.onDelete?.(props.task)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Supprimer
          </button>
        </Show>
      </div>
    </div>
  )
}
