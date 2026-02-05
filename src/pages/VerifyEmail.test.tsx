import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@solidjs/testing-library'
import { Router } from '@solidjs/router'
import VerifyEmail from './VerifyEmail'
import { AuthProvider } from '../lib/auth'

// Mock auth service
vi.mock('../services/auth.service', () => ({
  verifyEmail: vi.fn(),
  isEmailVerified: vi.fn().mockReturnValue(false),
}))

import * as authService from '../services/auth.service'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('@solidjs/router', async () => {
  const actual = await vi.importActual('@solidjs/router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [{ token_hash: 'valid-token', type: 'signup' }, vi.fn()],
  }
})

const renderVerifyEmail = () => {
  return render(() => (
    <AuthProvider>
      <Router>
        <VerifyEmail />
      </Router>
    </AuthProvider>
  ))
}

describe('VerifyEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Verification flow', () => {
    it('should show loading state while verifying', async () => {
      vi.mocked(authService.verifyEmail).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      renderVerifyEmail()

      expect(screen.getByText(/vérification en cours/i)).toBeInTheDocument()
    })

    it('should show success message on valid token', async () => {
      vi.mocked(authService.verifyEmail).mockResolvedValue({
        data: { user: { id: '123' } as any, session: { access_token: 'token' } as any },
        error: null,
      })

      renderVerifyEmail()

      await waitFor(() => {
        expect(screen.getByText(/email vérifié/i)).toBeInTheDocument()
      })
    })

    it('should redirect to home after successful verification', async () => {
      vi.useFakeTimers()

      vi.mocked(authService.verifyEmail).mockResolvedValue({
        data: { user: { id: '123' } as any, session: { access_token: 'token' } as any },
        error: null,
      })

      renderVerifyEmail()

      await waitFor(() => {
        expect(screen.getByText(/email vérifié/i)).toBeInTheDocument()
      })

      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })

      vi.useRealTimers()
    })

    it('should show error message on invalid token', async () => {
      vi.mocked(authService.verifyEmail).mockResolvedValue({
        error: 'Le lien a expiré ou est invalide',
      })

      renderVerifyEmail()

      await waitFor(() => {
        expect(screen.getByText(/erreur de vérification/i)).toBeInTheDocument()
        expect(screen.getByText(/expiré ou est invalide/i)).toBeInTheDocument()
      })
    })
  })
})
