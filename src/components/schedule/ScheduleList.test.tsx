/**
 * ScheduleList Component Tests
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@solidjs/testing-library'
import { ScheduleList } from './ScheduleList'
import * as scheduleService from '../../services/schedule.service'
import { scheduleStore } from '../../stores/schedule.store'
import type { ScheduleEntryWithStaff } from '../../lib/types/database'

// Mock the schedule service
vi.mock('../../services/schedule.service', () => ({
  getScheduleEntries: vi.fn(),
  deleteScheduleEntry: vi.fn(),
  updateScheduleStatus: vi.fn(),
}))

// Mock toast functions
vi.mock('../../components/ui/Toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

const mockScheduleEntries: ScheduleEntryWithStaff[] = [
  {
    id: 'entry-1',
    user_id: 'test-user-id',
    staff_member_id: 'staff-1',
    client_id: null,
    scheduled_date: '2026-02-10',
    start_time: '09:00:00',
    end_time: '12:00:00',
    description: 'Ménage salon',
    status: 'scheduled',
    notes: null,
    amount: null,
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
    staff_member: {
      id: 'staff-1',
      first_name: 'Marie',
      last_name: 'Dupont',
      position: 'housekeeper',
    },
    client: null,
  },
  {
    id: 'entry-2',
    user_id: 'test-user-id',
    staff_member_id: 'staff-2',
    client_id: null,
    scheduled_date: '2026-02-11',
    start_time: '14:00:00',
    end_time: null,
    description: 'Jardinage',
    status: 'completed',
    notes: 'Tailler les haies',
    amount: null,
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
    staff_member: {
      id: 'staff-2',
      first_name: 'Jean',
      last_name: 'Martin',
      position: 'gardener',
    },
    client: null,
  },
]

describe('ScheduleList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state before each test
    scheduleStore.actions.reset()
  })

  it('should show loading state initially', () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 100))
    )

    render(() => <ScheduleList />)

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('should show empty state when no schedule entries', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: [], error: null })

    render(() => <ScheduleList />)

    await waitFor(() => {
      expect(screen.getByText(/aucune intervention/i)).toBeInTheDocument()
    })
  })

  it('should render list of schedule entries', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: mockScheduleEntries, error: null })

    render(() => <ScheduleList />)

    await waitFor(() => {
      expect(screen.getByText('Ménage salon')).toBeInTheDocument()
      expect(screen.getByText('Jardinage')).toBeInTheDocument()
    })
  })

  it('should show staff member names', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: mockScheduleEntries, error: null })

    render(() => <ScheduleList />)

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
      expect(screen.getByText('Jean Martin')).toBeInTheDocument()
    })
  })

  it('should show error message when service fails', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: [], error: 'Échec du chargement des interventions' })

    render(() => <ScheduleList />)

    await waitFor(() => {
      expect(screen.getByText(/échec du chargement/i)).toBeInTheDocument()
    })
  })

  it('should call getScheduleEntries on mount', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: mockScheduleEntries.slice(0, 1), error: null })

    render(() => <ScheduleList />)

    await waitFor(() => {
      expect(screen.getByText('Ménage salon')).toBeInTheDocument()
    })

    expect(mockGet).toHaveBeenCalled()
  })

  it('should show status badges', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: mockScheduleEntries, error: null })

    render(() => <ScheduleList />)

    await waitFor(() => {
      expect(screen.getByText('Planifié')).toBeInTheDocument()
      expect(screen.getByText('Terminé')).toBeInTheDocument()
    })
  })

  it('should render multiple entries from different dates', async () => {
    const mockGet = vi.mocked(scheduleService.getScheduleEntries)
    mockGet.mockResolvedValue({ data: mockScheduleEntries, error: null })

    render(() => <ScheduleList />)

    await waitFor(() => {
      // Both entries should be visible
      expect(screen.getByText('Ménage salon')).toBeInTheDocument()
      expect(screen.getByText('Jardinage')).toBeInTheDocument()
    })
  })
})
