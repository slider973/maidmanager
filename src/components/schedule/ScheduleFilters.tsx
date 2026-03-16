/**
 * ScheduleFilters Component
 * Filter controls for the schedule list
 */

import { createSignal, Show, For, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { getStaffMembers } from '../../services/staff.service'
import { STATUS_LABELS, type StaffMember, type ScheduleFilters as ScheduleFiltersType } from '../../lib/types/database'

interface ScheduleFiltersProps {
  filters: ScheduleFiltersType
  onFiltersChange: (filters: Partial<ScheduleFiltersType>) => void
  onClear?: () => void
}

export const ScheduleFilters: Component<ScheduleFiltersProps> = (props) => {
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
    return props.filters.staffMemberId || props.filters.status
  }

  const handleStaffChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value
    props.onFiltersChange({ staffMemberId: value || undefined })
  }

  const handleStatusChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value as ScheduleFiltersType['status']
    props.onFiltersChange({ status: value || undefined })
  }

  return (
    <div class="schedule-filters">
      <div class="schedule-filter-group">
        <label class="schedule-filter-label" for="filter-staff">
          Membre du personnel
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
            <option value="">Tous les membres</option>
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

      <div class="schedule-filter-group">
        <label class="schedule-filter-label" for="filter-status">
          Statut
        </label>
        <select
          class="form-input form-select"
          id="filter-status"
          value={props.filters.status || ''}
          onChange={handleStatusChange}
        >
          <option value="">Tous les statuts</option>
          <option value="scheduled">{STATUS_LABELS.scheduled}</option>
          <option value="completed">{STATUS_LABELS.completed}</option>
          <option value="cancelled">{STATUS_LABELS.cancelled}</option>
        </select>
      </div>

      <Show when={hasActiveFilters()}>
        <div class="schedule-filter-actions">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            onClick={() => props.onClear?.()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Réinitialiser
          </button>
        </div>
      </Show>
    </div>
  )
}
