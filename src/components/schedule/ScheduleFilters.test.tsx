/**
 * ScheduleFilters Component Tests
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { ScheduleFilters } from './ScheduleFilters'
import * as staffService from '../../services/staff.service'
import type { StaffMember, ScheduleFilters as ScheduleFiltersType } from '../../lib/types/database'

// Mock the staff service
vi.mock('../../services/staff.service', () => ({
  getStaffMembers: vi.fn(),
}))

const mockStaffMembers: StaffMember[] = [
  {
    id: 'staff-1',
    user_id: 'test-user-id',
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
  {
    id: 'staff-2',
    user_id: 'test-user-id',
    first_name: 'Jean',
    last_name: 'Martin',
    position: 'gardener',
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

describe('ScheduleFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(staffService.getStaffMembers).mockResolvedValue({
      data: mockStaffMembers,
      error: null,
    })
  })

  it('should render filter controls', async () => {
    const onFiltersChange = vi.fn()
    render(() => <ScheduleFilters filters={{}} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/membre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/statut/i)).toBeInTheDocument()
    })
  })

  it('should render staff member options in select', async () => {
    const onFiltersChange = vi.fn()
    render(() => <ScheduleFilters filters={{}} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
      expect(screen.getByText('Jean Martin')).toBeInTheDocument()
    })
  })

  it('should render status options', async () => {
    const onFiltersChange = vi.fn()
    render(() => <ScheduleFilters filters={{}} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      const statusSelect = screen.getByLabelText(/statut/i) as HTMLSelectElement
      expect(statusSelect).toBeInTheDocument()

      // Check options exist
      expect(screen.getByRole('option', { name: 'Tous les statuts' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /planifié/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /terminé/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /annulé/i })).toBeInTheDocument()
    })
  })

  it('should call onFiltersChange when staff member is selected', async () => {
    const onFiltersChange = vi.fn()
    render(() => <ScheduleFilters filters={{}} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/membre/i)).toBeInTheDocument()
    })

    const staffSelect = screen.getByLabelText(/membre/i)
    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ staffMemberId: 'staff-1' })
  })

  it('should call onFiltersChange when status is selected', async () => {
    const onFiltersChange = vi.fn()
    render(() => <ScheduleFilters filters={{}} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/statut/i)).toBeInTheDocument()
    })

    const statusSelect = screen.getByLabelText(/statut/i)
    fireEvent.change(statusSelect, { target: { value: 'completed' } })

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'completed' })
  })

  it('should show reset button when filters are active', async () => {
    const onFiltersChange = vi.fn()
    const filters: ScheduleFiltersType = { staffMemberId: 'staff-1' }
    render(() => <ScheduleFilters filters={filters} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument()
    })
  })

  it('should not show reset button when no filters are active', async () => {
    const onFiltersChange = vi.fn()
    render(() => <ScheduleFilters filters={{}} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/membre/i)).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /réinitialiser/i })).not.toBeInTheDocument()
  })

  it('should call onClear when reset button is clicked', async () => {
    const onFiltersChange = vi.fn()
    const onClear = vi.fn()
    const filters: ScheduleFiltersType = { staffMemberId: 'staff-1', status: 'completed' }
    render(() => (
      <ScheduleFilters filters={filters} onFiltersChange={onFiltersChange} onClear={onClear} />
    ))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument()
    })

    const resetButton = screen.getByRole('button', { name: /réinitialiser/i })
    fireEvent.click(resetButton)

    expect(onClear).toHaveBeenCalled()
  })

  it('should reflect current filter values in the selects', async () => {
    const onFiltersChange = vi.fn()
    const filters: ScheduleFiltersType = { staffMemberId: 'staff-1', status: 'completed' }
    render(() => <ScheduleFilters filters={filters} onFiltersChange={onFiltersChange} />)

    await waitFor(() => {
      const staffSelect = screen.getByLabelText(/membre/i) as HTMLSelectElement
      const statusSelect = screen.getByLabelText(/statut/i) as HTMLSelectElement

      expect(staffSelect.value).toBe('staff-1')
      expect(statusSelect.value).toBe('completed')
    })
  })
})
