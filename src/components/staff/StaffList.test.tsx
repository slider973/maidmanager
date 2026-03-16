/**
 * StaffList Component Tests
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@solidjs/testing-library'
import { StaffList } from './StaffList'
import * as staffService from '../../services/staff.service'
import { staffStore } from '../../stores/staff.store'
import type { StaffMember } from '../../lib/types/database'

// Mock the router
vi.mock('@solidjs/router', () => ({
  A: (props: any) => <a href={props.href}>{props.children}</a>,
}))

// Mock the staff service
vi.mock('../../services/staff.service', () => ({
  getStaffMembers: vi.fn(),
  deleteStaffMember: vi.fn(),
}))

// Mock toast functions
vi.mock('../../components/ui/Toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

const mockStaffMembers: StaffMember[] = [
  {
    id: 'staff-1',
    user_id: 'test-user-id',
    first_name: 'Jean',
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
    first_name: 'Marie',
    last_name: 'Martin',
    position: 'cook',
    position_custom: null,
    phone: '0612345678',
    email: 'marie@example.com',
    start_date: '2026-01-01',
    notes: 'Excellente cuisinière',
    is_active: true,
    hourly_rate_cents: 0,
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
  },
  {
    id: 'staff-3',
    user_id: 'test-user-id',
    first_name: 'Pierre',
    last_name: 'Bernard',
    position: 'other',
    position_custom: 'Assistant',
    phone: null,
    email: null,
    start_date: null,
    notes: null,
    is_active: false,
    hourly_rate_cents: 0,
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
  },
]

describe('StaffList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state before each test
    staffStore.actions.reset()
  })

  it('should show loading state initially', () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 100))
    )

    render(() => <StaffList />)

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('should show empty state when no staff members', async () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockResolvedValue({ data: [], error: null })

    render(() => <StaffList />)

    await waitFor(() => {
      expect(screen.getByText(/aucun membre/i)).toBeInTheDocument()
    })
  })

  it('should render list of staff members', async () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockResolvedValue({ data: mockStaffMembers, error: null })

    render(() => <StaffList />)

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
      expect(screen.getByText('Pierre Bernard')).toBeInTheDocument()
    })
  })

  it('should show position label in French', async () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockResolvedValue({ data: [mockStaffMembers[0]], error: null })

    render(() => <StaffList />)

    await waitFor(() => {
      expect(screen.getByText('Femme de ménage')).toBeInTheDocument()
    })
  })

  it('should show custom position when position is "other"', async () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockResolvedValue({ data: [mockStaffMembers[2]], error: null })

    render(() => <StaffList />)

    await waitFor(() => {
      expect(screen.getByText('Assistant')).toBeInTheDocument()
    })
  })

  it('should show error message when service fails', async () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockResolvedValue({ data: [], error: 'Échec du chargement des membres' })

    render(() => <StaffList />)

    await waitFor(() => {
      expect(screen.getByText(/échec du chargement/i)).toBeInTheDocument()
    })
  })

  it('should call getStaffMembers on mount', async () => {
    const mockGet = vi.mocked(staffService.getStaffMembers)
    mockGet.mockResolvedValue({ data: mockStaffMembers.slice(0, 1), error: null })

    render(() => <StaffList />)

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    expect(mockGet).toHaveBeenCalled()
  })

  describe('Delete functionality', () => {
    it('should show delete button on each staff card', async () => {
      const mockGet = vi.mocked(staffService.getStaffMembers)
      mockGet.mockResolvedValue({ data: mockStaffMembers.slice(0, 2), error: null })

      render(() => <StaffList />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i })
        expect(deleteButtons).toHaveLength(2)
      })
    })

    it('should have accessible label on delete button', async () => {
      const mockGet = vi.mocked(staffService.getStaffMembers)
      mockGet.mockResolvedValue({ data: [mockStaffMembers[0]], error: null })

      render(() => <StaffList />)

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /supprimer jean dupont/i })
        expect(deleteButton).toBeInTheDocument()
      })
    })

    it('should open confirmation dialog when delete button is clicked', async () => {
      const mockGet = vi.mocked(staffService.getStaffMembers)
      mockGet.mockResolvedValue({ data: [mockStaffMembers[0]], error: null })

      render(() => <StaffList />)

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /supprimer jean dupont/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should show member name in confirmation dialog', async () => {
      const mockGet = vi.mocked(staffService.getStaffMembers)
      mockGet.mockResolvedValue({ data: [mockStaffMembers[0]], error: null })

      render(() => <StaffList />)

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /supprimer jean dupont/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        // Check dialog contains member name (text is split across elements)
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveTextContent(/Jean/)
        expect(dialog).toHaveTextContent(/Dupont/)
      })
    })

    it('should close dialog when cancel is clicked', async () => {
      const mockGet = vi.mocked(staffService.getStaffMembers)
      mockGet.mockResolvedValue({ data: [mockStaffMembers[0]], error: null })

      render(() => <StaffList />)

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /supprimer jean dupont/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should delete member and refresh list when confirmed', async () => {
      const mockGet = vi.mocked(staffService.getStaffMembers)
      const mockDelete = vi.mocked(staffService.deleteStaffMember)

      mockGet.mockResolvedValue({ data: [mockStaffMembers[0]], error: null })
      mockDelete.mockResolvedValue({ error: null })

      const onDelete = vi.fn()
      render(() => <StaffList onDelete={onDelete} />)

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /supprimer jean dupont/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // The button text is "Supprimer" not "Confirmer"
      const confirmButton = screen.getByRole('button', { name: /supprimer$/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('staff-1')
        expect(onDelete).toHaveBeenCalled()
      })
    })
  })
})
