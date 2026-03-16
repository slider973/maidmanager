/**
 * TaskFilters Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { TaskFilters } from './TaskFilters'
import * as staffService from '../../services/staff.service'
import type { StaffMember } from '../../lib/types/database'
import type { TaskFilters as TaskFiltersType } from '../../lib/types/task.types'

// Mock the service
vi.mock('../../services/staff.service', () => ({
  getStaffMembers: vi.fn(),
}))

describe('TaskFilters', () => {
  const mockStaffMembers: StaffMember[] = [
    {
      id: 'staff-1',
      user_id: 'user-1',
      first_name: 'Marie',
      last_name: 'Dupont',
      position: 'housekeeper',
      position_custom: null,
      phone: null,
      email: null,
      start_date: null,
      notes: null,
      is_active: true,
    hourly_rate_cents: 0,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    },
  ]

  const emptyFilters: TaskFiltersType = {}

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(staffService.getStaffMembers).mockResolvedValue({
      data: mockStaffMembers,
      error: null,
    })
  })

  it('should render staff member filter', async () => {
    const onFiltersChange = vi.fn()
    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
      />
    ))

    await waitFor(() => {
      expect(screen.getByLabelText('Membre')).toBeInTheDocument()
    })
  })

  it('should render status filter', () => {
    const onFiltersChange = vi.fn()
    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
      />
    ))

    expect(screen.getByLabelText('Statut')).toBeInTheDocument()
  })

  it('should render priority filter', () => {
    const onFiltersChange = vi.fn()
    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
      />
    ))

    expect(screen.getByLabelText('Priorité')).toBeInTheDocument()
  })

  it('should call onFiltersChange when staff filter changes', async () => {
    const onFiltersChange = vi.fn()
    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
      />
    ))

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    })

    const staffSelect = screen.getByLabelText('Membre')
    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ staffMemberId: 'staff-1' })
  })

  it('should call onFiltersChange when status filter changes', () => {
    const onFiltersChange = vi.fn()
    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
      />
    ))

    const statusSelect = screen.getByLabelText('Statut')
    fireEvent.change(statusSelect, { target: { value: 'completed' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'completed' })
  })

  it('should call onFiltersChange when priority filter changes', () => {
    const onFiltersChange = vi.fn()
    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
      />
    ))

    const prioritySelect = screen.getByLabelText('Priorité')
    fireEvent.change(prioritySelect, { target: { value: 'urgent' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ priority: 'urgent' })
  })

  it('should show clear button when filters are active', () => {
    const onFiltersChange = vi.fn()
    const onClear = vi.fn()
    const activeFilters: TaskFiltersType = { status: 'pending' }

    render(() => (
      <TaskFilters
        filters={activeFilters}
        onFiltersChange={onFiltersChange}
        onClear={onClear}
      />
    ))

    expect(screen.getByText(/Réinitialiser/)).toBeInTheDocument()
  })

  it('should not show clear button when no filters are active', () => {
    const onFiltersChange = vi.fn()
    const onClear = vi.fn()

    render(() => (
      <TaskFilters
        filters={emptyFilters}
        onFiltersChange={onFiltersChange}
        onClear={onClear}
      />
    ))

    expect(screen.queryByText(/Réinitialiser/)).not.toBeInTheDocument()
  })

  it('should call onClear when clear button is clicked', () => {
    const onFiltersChange = vi.fn()
    const onClear = vi.fn()
    const activeFilters: TaskFiltersType = { status: 'pending' }

    render(() => (
      <TaskFilters
        filters={activeFilters}
        onFiltersChange={onFiltersChange}
        onClear={onClear}
      />
    ))

    const clearButton = screen.getByText(/Réinitialiser/)
    fireEvent.click(clearButton)

    expect(onClear).toHaveBeenCalled()
  })

  it('should show filter count in clear button', () => {
    const onFiltersChange = vi.fn()
    const onClear = vi.fn()
    const activeFilters: TaskFiltersType = {
      status: 'pending',
      priority: 'high',
    }

    render(() => (
      <TaskFilters
        filters={activeFilters}
        onFiltersChange={onFiltersChange}
        onClear={onClear}
      />
    ))

    expect(screen.getByText(/\(2\)/)).toBeInTheDocument()
  })
})
