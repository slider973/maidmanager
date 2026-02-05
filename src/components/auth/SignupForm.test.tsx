import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { SignupForm } from './SignupForm'
import { AuthProvider } from '../../lib/auth'

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  signUp: vi.fn(),
  isEmailVerified: vi.fn().mockReturnValue(false),
}))

import * as authService from '../../services/auth.service'

const renderSignupForm = (props = {}) => {
  return render(() => (
    <AuthProvider>
      <SignupForm {...props} />
    </AuthProvider>
  ))
}

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render email input with label', () => {
      renderSignupForm()
      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
    })

    it('should render password input with label', () => {
      renderSignupForm()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      renderSignupForm()
      expect(screen.getByRole('button', { name: /créer/i })).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should show error for invalid email format', async () => {
      renderSignupForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      // Form should not submit with invalid email (HTML5 validation)
      expect(authService.signUp).not.toHaveBeenCalled()
    })

    it('should show error for password less than 8 characters', async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        error: 'Le mot de passe doit contenir au moins 8 caractères',
      })

      renderSignupForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument()
      })
    })

    it('should accept valid email and password', async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        data: { user: null, session: null, needsVerification: true },
        error: null,
      })

      const onSuccess = vi.fn()
      renderSignupForm({ onSuccess })

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(authService.signUp).toHaveBeenCalledWith('test@example.com', 'validpassword123')
      })
    })
  })

  describe('Error handling', () => {
    it('should display error message when signup fails', async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        error: 'Cet email est déjà utilisé',
      })

      renderSignupForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/cet email est déjà utilisé/i)).toBeInTheDocument()
      })
    })
  })

  describe('Success flow', () => {
    it('should show verification message on successful signup', async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        data: { user: null, session: null, needsVerification: true },
        error: null,
      })

      renderSignupForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'new@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/vérifiez votre email/i)).toBeInTheDocument()
      })
    })

    it('should call onSuccess callback when verification not needed', async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' } as any,
          session: { access_token: 'token' } as any,
          needsVerification: false
        },
        error: null,
      })

      const onSuccess = vi.fn()
      renderSignupForm({ onSuccess })

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Loading state', () => {
    it('should disable submit button while loading', async () => {
      vi.mocked(authService.signUp).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      renderSignupForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /créer/i })

      fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })
})
