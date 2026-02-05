import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { LoginForm } from './LoginForm'
import { AuthProvider } from '../../lib/auth'

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  signIn: vi.fn(),
  isEmailVerified: vi.fn().mockReturnValue(false),
}))

import * as authService from '../../services/auth.service'

const renderLoginForm = (props = {}) => {
  return render(() => (
    <AuthProvider>
      <LoginForm {...props} />
    </AuthProvider>
  ))
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render email input with label', () => {
      renderLoginForm()
      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
    })

    it('should render password input with label', () => {
      renderLoginForm()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      renderLoginForm()
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    })

    it('should render forgot password link when provided', () => {
      render(() => (
        <AuthProvider>
          <LoginForm
            forgotPasswordLink={<a href="/forgot-password">Mot de passe oublié?</a>}
          />
        </AuthProvider>
      ))
      expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should not submit with empty email', async () => {
      renderLoginForm()

      const submitButton = screen.getByRole('button', { name: /se connecter/i })
      fireEvent.click(submitButton)

      expect(authService.signIn).not.toHaveBeenCalled()
    })

    it('should show error for invalid credentials', async () => {
      vi.mocked(authService.signIn).mockResolvedValue({
        error: 'Email ou mot de passe incorrect',
      })

      renderLoginForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument()
      })
    })
  })

  describe('Unverified user handling', () => {
    it('should show verification message for unverified user', async () => {
      vi.mocked(authService.signIn).mockResolvedValue({
        error: 'Veuillez confirmer votre email',
      })

      renderLoginForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.input(emailInput, { target: { value: 'unverified@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/confirmer votre email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Success flow', () => {
    it('should call onSuccess callback on successful login', async () => {
      vi.mocked(authService.signIn).mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' } as any,
          session: { access_token: 'token' } as any,
        },
        error: null,
      })

      const onSuccess = vi.fn()
      renderLoginForm({ onSuccess })

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

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
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      renderLoginForm()

      const emailInput = screen.getByLabelText(/adresse email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.input(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })
})
