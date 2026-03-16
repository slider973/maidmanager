/**
 * StaffForm Component Tests
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { StaffForm } from './StaffForm'
import * as staffService from '../../services/staff.service'

// Mock the staff service
vi.mock('../../services/staff.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/staff.service')>()
  return {
    ...actual,
    createStaffMember: vi.fn(),
  }
})

// Mock useAuth hook
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    user: () => ({ id: 'test-user-id' }),
  }),
}))

describe('StaffForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the form with required fields', () => {
    render(() => <StaffForm />)

    expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByLabelText('Poste')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
  })

  it('should show all position options in dropdown', () => {
    render(() => <StaffForm />)

    const select = screen.getByLabelText('Poste')
    expect(select).toBeInTheDocument()

    // Check all position options are available
    expect(screen.getByText('Femme de ménage')).toBeInTheDocument()
    expect(screen.getByText('Jardinier')).toBeInTheDocument()
    expect(screen.getByText('Cuisinier')).toBeInTheDocument()
    expect(screen.getByText('Chauffeur')).toBeInTheDocument()
    expect(screen.getByText('Nounou')).toBeInTheDocument()
    expect(screen.getByText('Gardien')).toBeInTheDocument()
    expect(screen.getByText('Autre')).toBeInTheDocument()
  })

  it('should show custom position field when "Autre" is selected', async () => {
    render(() => <StaffForm />)

    const select = screen.getByLabelText('Poste')
    fireEvent.change(select, { target: { value: 'other' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Préciser le poste')).toBeInTheDocument()
    })
  })

  it('should have required attribute on first name field', () => {
    render(() => <StaffForm />)

    const firstNameInput = screen.getByLabelText('Prénom')
    expect(firstNameInput).toHaveAttribute('required')
  })

  it('should have required attribute on last name field', () => {
    render(() => <StaffForm />)

    const lastNameInput = screen.getByLabelText('Nom')
    expect(lastNameInput).toHaveAttribute('required')
  })

  it('should show custom position field as required when other is selected', async () => {
    render(() => <StaffForm />)

    const select = screen.getByLabelText('Poste')
    fireEvent.change(select, { target: { value: 'other' } })

    await waitFor(() => {
      const customInput = screen.getByLabelText('Préciser le poste')
      expect(customInput).toHaveAttribute('required')
    })
  })

  it('should call createStaffMember with valid data', async () => {
    const mockCreate = vi.mocked(staffService.createStaffMember)
    mockCreate.mockResolvedValue({
      data: {
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
      error: null,
    })

    const onSuccess = vi.fn()
    render(() => <StaffForm onSuccess={onSuccess} />)

    const firstNameInput = screen.getByLabelText('Prénom')
    fireEvent.input(firstNameInput, { target: { value: 'Jean' } })

    const lastNameInput = screen.getByLabelText('Nom')
    fireEvent.input(lastNameInput, { target: { value: 'Dupont' } })

    const select = screen.getByLabelText('Poste')
    fireEvent.change(select, { target: { value: 'housekeeper' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        first_name: 'Jean',
        last_name: 'Dupont',
        position: 'housekeeper',
        position_custom: null,
        phone: null,
        email: null,
        start_date: null,
        hourly_rate_cents: 0,
        notes: null,
      })
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should reset form after successful submission', async () => {
    const mockCreate = vi.mocked(staffService.createStaffMember)
    mockCreate.mockResolvedValue({
      data: {
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
      error: null,
    })

    render(() => <StaffForm />)

    const firstNameInput = screen.getByLabelText('Prénom') as HTMLInputElement
    fireEvent.input(firstNameInput, { target: { value: 'Jean' } })

    const lastNameInput = screen.getByLabelText('Nom') as HTMLInputElement
    fireEvent.input(lastNameInput, { target: { value: 'Dupont' } })

    const select = screen.getByLabelText('Poste') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'housekeeper' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(firstNameInput.value).toBe('')
      expect(lastNameInput.value).toBe('')
      expect(select.value).toBe('')
    })
  })

  it('should show error message when service fails', async () => {
    const mockCreate = vi.mocked(staffService.createStaffMember)
    mockCreate.mockResolvedValue({
      error: 'Échec de la création du membre',
    })

    render(() => <StaffForm />)

    const firstNameInput = screen.getByLabelText('Prénom')
    fireEvent.input(firstNameInput, { target: { value: 'Jean' } })

    const lastNameInput = screen.getByLabelText('Nom')
    fireEvent.input(lastNameInput, { target: { value: 'Dupont' } })

    const select = screen.getByLabelText('Poste')
    fireEvent.change(select, { target: { value: 'housekeeper' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/échec de la création du membre/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    const mockCreate = vi.mocked(staffService.createStaffMember)
    mockCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: undefined, error: null }), 100))
    )

    render(() => <StaffForm />)

    const firstNameInput = screen.getByLabelText('Prénom')
    fireEvent.input(firstNameInput, { target: { value: 'Jean' } })

    const lastNameInput = screen.getByLabelText('Nom')
    fireEvent.input(lastNameInput, { target: { value: 'Dupont' } })

    const select = screen.getByLabelText('Poste')
    fireEvent.change(select, { target: { value: 'housekeeper' } })

    const submitButton = screen.getByRole('button', { name: /ajouter/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
