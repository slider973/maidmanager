/**
 * TaskForm Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { TaskForm } from './TaskForm'
import * as staffService from '../../services/staff.service'
import * as taskService from '../../services/task.service'
import type { StaffMember } from '../../lib/types/database'

// Mock the services
vi.mock('../../services/staff.service', () => ({
  getStaffMembers: vi.fn(),
}))

vi.mock('../../services/task.service', () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  validateTask: vi.fn(),
}))

vi.mock('../ui/Toast', () => ({
  showSuccess: vi.fn(),
}))

describe('TaskForm', () => {
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
    {
      id: 'staff-2',
      user_id: 'user-1',
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

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(staffService.getStaffMembers).mockResolvedValue({
      data: mockStaffMembers,
      error: null,
    })
    vi.mocked(taskService.validateTask).mockReturnValue(null)
    vi.mocked(taskService.createTask).mockResolvedValue({
      data: {
        id: 'task-1',
        user_id: 'user-1',
        staff_member_id: 'staff-1',
        title: 'Test task',
        description: null,
        due_date: '2026-02-10',
        priority: 'normal',
        status: 'pending',
        notes: null,
        created_at: '2026-02-06T00:00:00Z',
        updated_at: '2026-02-06T00:00:00Z',
      },
      error: null,
    })
  })

  it('should render all form fields', async () => {
    render(() => <TaskForm />)

    await waitFor(() => {
      expect(screen.getByLabelText('Membre du personnel')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Titre de la mission')).toBeInTheDocument()
    expect(screen.getByLabelText("Date d'échéance")).toBeInTheDocument()
    expect(screen.getByLabelText('Priorité')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optionnel)')).toBeInTheDocument()
    expect(screen.getByLabelText('Notes (optionnel)')).toBeInTheDocument()
  })

  it('should load staff members on mount', async () => {
    render(() => <TaskForm />)

    await waitFor(() => {
      expect(staffService.getStaffMembers).toHaveBeenCalledWith({ isActive: true })
    })
  })

  it('should show staff members in select', async () => {
    render(() => <TaskForm />)

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
      expect(screen.getByText('Jean Martin')).toBeInTheDocument()
    })
  })

  it('should show loading state while fetching staff', () => {
    // Don't resolve the promise immediately
    vi.mocked(staffService.getStaffMembers).mockImplementation(
      () => new Promise(() => {})
    )

    render(() => <TaskForm />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should show validation error when submitting invalid form', async () => {
    vi.mocked(taskService.validateTask).mockReturnValue('Le titre est requis')

    const { container } = render(() => <TaskForm />)

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    })

    // Select a staff member first to avoid HTML5 required validation
    const staffSelect = screen.getByLabelText('Membre du personnel')
    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })

    // Fill required fields but let validateTask return error
    const titleInput = screen.getByLabelText('Titre de la mission')
    const dueDateInput = screen.getByLabelText("Date d'échéance")
    fireEvent.input(titleInput, { target: { value: 'Test' } })
    fireEvent.input(dueDateInput, { target: { value: '2026-02-10' } })

    const form = container.querySelector('form')
    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(() => {
      expect(screen.getByText('Le titre est requis')).toBeInTheDocument()
    })
  })

  it('should call onSuccess after successful creation', async () => {
    const onSuccess = vi.fn()

    render(() => <TaskForm onSuccess={onSuccess} />)

    await waitFor(() => {
      expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    })

    // Fill out the form
    const staffSelect = screen.getByLabelText('Membre du personnel')
    const titleInput = screen.getByLabelText('Titre de la mission')
    const dueDateInput = screen.getByLabelText("Date d'échéance")

    fireEvent.change(staffSelect, { target: { value: 'staff-1' } })
    fireEvent.input(titleInput, { target: { value: 'Test task' } })
    fireEvent.input(dueDateInput, { target: { value: '2026-02-10' } })

    const submitButton = screen.getByText('Créer la mission')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show "Modifier la mission" button in edit mode', async () => {
    const mockTask = {
      id: 'task-1',
      user_id: 'user-1',
      staff_member_id: 'staff-1',
      title: 'Test task',
      description: null,
      due_date: '2026-02-10',
      priority: 'normal' as const,
      status: 'pending' as const,
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: null,
    }

    render(() => <TaskForm mode="edit" initialData={mockTask} />)

    await waitFor(() => {
      expect(screen.getByText('Modifier la mission')).toBeInTheDocument()
    })
  })

  it('should show cancel button in edit mode', async () => {
    const onCancel = vi.fn()
    const mockTask = {
      id: 'task-1',
      user_id: 'user-1',
      staff_member_id: 'staff-1',
      title: 'Test task',
      description: null,
      due_date: '2026-02-10',
      priority: 'normal' as const,
      status: 'pending' as const,
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: null,
    }

    render(() => <TaskForm mode="edit" initialData={mockTask} onCancel={onCancel} />)

    await waitFor(() => {
      expect(screen.getByText('Annuler')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Annuler'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should pre-fill form fields in edit mode', async () => {
    const mockTask = {
      id: 'task-1',
      user_id: 'user-1',
      staff_member_id: 'staff-1',
      title: 'Test task',
      description: 'Test description',
      due_date: '2026-02-10',
      priority: 'high' as const,
      status: 'pending' as const,
      notes: 'Some notes',
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: null,
    }

    render(() => <TaskForm mode="edit" initialData={mockTask} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2026-02-10')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Some notes')).toBeInTheDocument()
    })
  })
})
