/**
 * WorkSessionFilters Component
 * Filters for work sessions by period and staff member
 */

import { createSignal, Show, For } from 'solid-js'
import type { Component } from 'solid-js'
import type { StaffMember } from '../../lib/types/database'
import type { WorkSessionFilters as Filters } from '../../lib/types/payments.types'

interface WorkSessionFiltersProps {
  staffMembers?: StaffMember[]
  showStaffFilter?: boolean
  onFilterChange: (filters: Filters) => void
}

export const WorkSessionFilters: Component<WorkSessionFiltersProps> = (props) => {
  const [selectedMonth, setSelectedMonth] = createSignal('')
  const [selectedStaffId, setSelectedStaffId] = createSignal('')

  // Generate month options for the last 12 months
  const monthOptions = () => {
    const options: { value: string; label: string }[] = []
    const today = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }

    return options
  }

  // Calculate start and end dates from selected month
  const getDateRange = (monthValue: string): { startDate?: string; endDate?: string } => {
    if (!monthValue) return {}

    const [year, month] = monthValue.split('-').map(Number)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`

    // Last day of the month
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    return { startDate, endDate }
  }

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    applyFilters(value, selectedStaffId())
  }

  const handleStaffChange = (value: string) => {
    setSelectedStaffId(value)
    applyFilters(selectedMonth(), value)
  }

  const applyFilters = (month: string, staffId: string) => {
    const dateRange = getDateRange(month)
    const filters: Filters = {
      ...dateRange,
      staffMemberId: staffId || undefined,
    }
    props.onFilterChange(filters)
  }

  const clearFilters = () => {
    setSelectedMonth('')
    setSelectedStaffId('')
    props.onFilterChange({})
  }

  const hasFilters = () => selectedMonth() || selectedStaffId()

  return (
    <div class="work-session-filters">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label" for="month-filter">
            Période
          </label>
          <select
            id="month-filter"
            class="filter-select"
            value={selectedMonth()}
            onChange={(e) => handleMonthChange(e.currentTarget.value)}
          >
            <option value="">Toutes les périodes</option>
            <For each={monthOptions()}>
              {(option) => <option value={option.value}>{option.label}</option>}
            </For>
          </select>
        </div>

        <Show when={props.showStaffFilter && props.staffMembers}>
          <div class="filter-group">
            <label class="filter-label" for="staff-filter">
              Employé
            </label>
            <select
              id="staff-filter"
              class="filter-select"
              value={selectedStaffId()}
              onChange={(e) => handleStaffChange(e.currentTarget.value)}
            >
              <option value="">Tous les employés</option>
              <For each={props.staffMembers}>
                {(staff) => (
                  <option value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                )}
              </For>
            </select>
          </div>
        </Show>

        <Show when={hasFilters()}>
          <button type="button" class="btn btn-sm btn-ghost" onClick={clearFilters}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Effacer
          </button>
        </Show>
      </div>
    </div>
  )
}
