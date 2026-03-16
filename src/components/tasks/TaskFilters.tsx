/**
 * TaskFilters Component
 * Filter controls for the task list
 */

import { createSignal, Show, For, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { getStaffMembers } from '../../services/staff.service'
import type { StaffMember } from '../../lib/types/database'
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  PRIORITY_LABELS,
  type TaskFilters as TaskFiltersType,
  type TaskStatus,
  type TaskPriority,
} from '../../lib/types/task.types'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void
  onClear?: () => void
}

export const TaskFilters: Component<TaskFiltersProps> = (props) => {
  const [staffMembers, setStaffMembers] = createSignal<StaffMember[]>([])
  const [loadingStaff, setLoadingStaff] = createSignal(true)

  // Fetch staff members on mount
  onMount(async () => {
    const result = await getStaffMembers({ isActive: true })
    if (!result.error && result.data) {
      setStaffMembers(result.data)
    }
    setLoadingStaff(false)
  })

  const hasActiveFilters = () => {
    return props.filters.staffMemberId || props.filters.status || props.filters.priority
  }

  const activeFilterCount = () => {
    let count = 0
    if (props.filters.staffMemberId) count++
    if (props.filters.status) count++
    if (props.filters.priority) count++
    return count
  }

  const handleStaffChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value
    props.onFiltersChange({ staffMemberId: value || undefined })
  }

  const handleStatusChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value as TaskStatus | ''
    props.onFiltersChange({ status: value || undefined })
  }

  const handlePriorityChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value as TaskPriority | ''
    props.onFiltersChange({ priority: value || undefined })
  }

  return (
    <div class="task-filters">
      <div class="task-filter-group">
        <label class="task-filter-label" for="filter-staff">
          Membre
        </label>
        <Show
          when={!loadingStaff()}
          fallback={
            <select class="form-input form-select" disabled>
              <option>Chargement...</option>
            </select>
          }
        >
          <select
            class="form-input form-select"
            id="filter-staff"
            value={props.filters.staffMemberId || ''}
            onChange={handleStaffChange}
          >
            <option value="">Tous</option>
            <For each={staffMembers()}>
              {(staff) => (
                <option value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              )}
            </For>
          </select>
        </Show>
      </div>

      <div class="task-filter-group">
        <label class="task-filter-label" for="filter-status">
          Statut
        </label>
        <select
          class="form-input form-select"
          id="filter-status"
          value={props.filters.status || ''}
          onChange={handleStatusChange}
        >
          <option value="">Tous</option>
          <For each={TASK_STATUSES}>
            {(status) => (
              <option value={status}>{TASK_STATUS_LABELS[status]}</option>
            )}
          </For>
        </select>
      </div>

      <div class="task-filter-group">
        <label class="task-filter-label" for="filter-priority">
          Priorité
        </label>
        <select
          class="form-input form-select"
          id="filter-priority"
          value={props.filters.priority || ''}
          onChange={handlePriorityChange}
        >
          <option value="">Toutes</option>
          <For each={TASK_PRIORITIES}>
            {(priority) => (
              <option value={priority}>{PRIORITY_LABELS[priority]}</option>
            )}
          </For>
        </select>
      </div>

      <Show when={hasActiveFilters()}>
        <div class="task-filter-actions">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            onClick={() => props.onClear?.()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Réinitialiser ({activeFilterCount()})
          </button>
        </div>
      </Show>
    </div>
  )
}
