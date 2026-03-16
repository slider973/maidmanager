/**
 * ScheduleForm Component Tests
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { ScheduleForm } from './ScheduleForm'
import * as scheduleService from '../../services/schedule.service'
import * as staffService from '../../services/staff.service'
import { scheduleStore } from '../../stores/schedule.store'
import type { StaffMember } from '../../lib/types/database'

// Mock the services
vi.mock('../../services/schedule.service', () => ({
  createScheduleEntry: vi.fn(),
  validateScheduleEntry: vi.fn(() => null),
}))

vi.mock('../../services/staff.service', () => ({
  getStaffMembers: vi.fn(),
}))

// Mock toast functions
vi.mock('../../components/ui/Toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

// Mock auth hook
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: () => ({ id: 'test-user-id', email: 'test@example.com' }),
    session: () => ({}),
    loading: () => false,
  }),
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

describe('ScheduleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    scheduleStore.actions.reset()
    // Default: return mock staff members
    vi.mocked(staffService.getStaffMembers).mockResolvedValue({
      data: mockStaffMembers,
      error: null,
    })
  })

  it('should render the form with required fields', async () => {
    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/membre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/heure de début/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })
  })

  it('should render staff member options in select', async () => {
    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
      expect(screen.getByText('Jean Martin')).toBeInTheDocument()
    })
  })

  it('should render optional end time field', async () => {
    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/heure de fin/i)).toBeInTheDocument()
    })
  })

  it('should render optional notes field', async () => {
    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })
  })

  it('should show submit button', async () => {
    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })
  })

  it('should call validateScheduleEntry on submission', async () => {
    vi.mocked(scheduleService.validateScheduleEntry).mockReturnValue(
      'Veuillez sélectionner un membre du personnel'
    )

    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })

    // Fill in all fields
    const staffSelect = screen.getByLabelText(/membre/i)
    const dateInput = screen.getByLabelText(/date/i)
    const startTimeInput = screen.getByLabelText(/heure de début/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })
    fireEvent.change(dateInput, { target: { value: '2026-02-10' } })
    fireEvent.change(startTimeInput, { target: { value: '09:00' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(scheduleService.validateScheduleEntry).toHaveBeenCalled()
      expect(screen.getByText(/veuillez sélectionner un membre/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for description', async () => {
    vi.mocked(scheduleService.validateScheduleEntry).mockReturnValue(
      'La description est requise'
    )

    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })

    // Fill in all fields
    const staffSelect = screen.getByLabelText(/membre/i)
    const dateInput = screen.getByLabelText(/date/i)
    const startTimeInput = screen.getByLabelText(/heure de début/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })
    fireEvent.change(dateInput, { target: { value: '2026-02-10' } })
    fireEvent.change(startTimeInput, { target: { value: '09:00' } })
    fireEvent.change(descriptionInput, { target: { value: 'x' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/description est requise/i)).toBeInTheDocument()
    })
  })

  it('should call createScheduleEntry on valid submission', async () => {
    vi.mocked(scheduleService.validateScheduleEntry).mockReturnValue(null)
    vi.mocked(scheduleService.createScheduleEntry).mockResolvedValue({
      data: {
        id: 'entry-1',
        user_id: 'test-user-id',
        staff_member_id: 'staff-1',
        client_id: null,
        scheduled_date: '2026-02-10',
        start_time: '09:00',
        end_time: null,
        description: 'Ménage salon',
        status: 'scheduled',
        notes: null,
        amount: null,
        created_at: '2026-02-06T00:00:00Z',
        updated_at: '2026-02-06T00:00:00Z',
      },
      error: null,
    })

    const onSuccess = vi.fn()
    render(() => <ScheduleForm onSuccess={onSuccess} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })

    // Fill in the form
    const staffSelect = screen.getByLabelText(/membre/i)
    const dateInput = screen.getByLabelText(/date/i)
    const startTimeInput = screen.getByLabelText(/heure de début/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })
    fireEvent.change(dateInput, { target: { value: '2026-02-10' } })
    fireEvent.change(startTimeInput, { target: { value: '09:00' } })
    fireEvent.change(descriptionInput, { target: { value: 'Ménage salon' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(scheduleService.createScheduleEntry).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should clear form after successful submission', async () => {
    vi.mocked(scheduleService.validateScheduleEntry).mockReturnValue(null)
    vi.mocked(scheduleService.createScheduleEntry).mockResolvedValue({
      data: {
        id: 'entry-1',
        user_id: 'test-user-id',
        staff_member_id: 'staff-1',
        client_id: null,
        scheduled_date: '2026-02-10',
        start_time: '09:00',
        end_time: null,
        description: 'Test description for clearing',
        status: 'scheduled',
        notes: null,
        amount: null,
        created_at: '2026-02-06T00:00:00Z',
        updated_at: '2026-02-06T00:00:00Z',
      },
      error: null,
    })

    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })

    // Fill all fields
    const staffSelect = screen.getByLabelText(/membre/i) as HTMLSelectElement
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    const startTimeInput = screen.getByLabelText(/heure de début/i) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement

    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })
    fireEvent.change(dateInput, { target: { value: '2026-02-10' } })
    fireEvent.change(startTimeInput, { target: { value: '09:00' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description for clearing' } })

    // Verify values are set
    expect(descriptionInput.value).toBe('Test description for clearing')

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    // Wait for the service call and then verify form is cleared
    await waitFor(() => {
      expect(scheduleService.createScheduleEntry).toHaveBeenCalled()
    })

    // After successful submission, form should be cleared
    await waitFor(() => {
      const clearedStaff = screen.getByLabelText(/membre/i) as HTMLSelectElement
      expect(clearedStaff.value).toBe('')
    })
  })

  it('should show error when service fails', async () => {
    vi.mocked(scheduleService.validateScheduleEntry).mockReturnValue(null)
    vi.mocked(scheduleService.createScheduleEntry).mockResolvedValue({
      error: "Échec de la création de l'intervention",
    })

    render(() => <ScheduleForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })

    // Fill in the form
    const staffSelect = screen.getByLabelText(/membre/i)
    const dateInput = screen.getByLabelText(/date/i)
    const startTimeInput = screen.getByLabelText(/heure de début/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })
    fireEvent.change(dateInput, { target: { value: '2026-02-10' } })
    fireEvent.change(startTimeInput, { target: { value: '09:00' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/échec de la création/i)).toBeInTheDocument()
    })
  })
})
