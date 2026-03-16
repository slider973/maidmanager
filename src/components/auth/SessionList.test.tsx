import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { SessionList } from './SessionList'
import { AuthProvider } from '../../lib/auth'

// Mock the session service
vi.mock('../../services/session.service', () => ({
  getSessions: vi.fn(),
  deleteSession: vi.fn(),
  deleteOtherSessions: vi.fn(),
  formatRelativeTime: vi.fn(() => 'Il y a 5 minutes'),
}))

const renderSessionList = () => {
  return render(() => (
    <AuthProvider>
      <SessionList />
    </AuthProvider>
  ))
}

import * as sessionService from '../../services/session.service'

const mockSessions = [
  {
    id: 'session-1',
    user_id: 'user-1',
    device_info: 'Mozilla/5.0 Chrome',
    browser: 'Chrome 120',
    os: 'macOS 14',
    ip_address: null,
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_current: true,
  },
  {
    id: 'session-2',
    user_id: 'user-1',
    device_info: 'Mozilla/5.0 Firefox',
    browser: 'Firefox 121',
    os: 'Windows 10/11',
    ip_address: null,
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_current: false,
  },
]

describe('SessionList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should show loading state initially', () => {
      vi.mocked(sessionService.getSessions).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderSessionList()
      expect(screen.getByText(/chargement/i)).toBeInTheDocument()
    })

    it('should display sessions when loaded', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/Chrome 120/i)).toBeInTheDocument()
        expect(screen.getByText(/Firefox 121/i)).toBeInTheDocument()
      })
    })

    it('should mark current session', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/session actuelle/i)).toBeInTheDocument()
      })
    })

    it('should show OS information', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/macOS 14/i)).toBeInTheDocument()
        expect(screen.getByText(/Windows/i)).toBeInTheDocument()
      })
    })

    it('should show empty state when no sessions', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: [],
        error: null,
      })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/aucune session/i)).toBeInTheDocument()
      })
    })

    it('should show error message on failure', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: [],
        error: 'Erreur lors de la récupération des sessions',
      })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument()
      })
    })
  })

  describe('Session termination', () => {
    it('should have disconnect button for non-current sessions', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })

      renderSessionList()

      await waitFor(() => {
        const disconnectButtons = screen.getAllByRole('button', { name: /déconnecter/i })
        // Should have one for the non-current session
        expect(disconnectButtons.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should call deleteSession when clicking disconnect', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })
      vi.mocked(sessionService.deleteSession).mockResolvedValue({ error: null })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/Firefox 121/i)).toBeInTheDocument()
      })

      // Find the disconnect button for the non-current session
      const disconnectButtons = screen.getAllByRole('button', { name: /déconnecter$/i })
      fireEvent.click(disconnectButtons[0])

      await waitFor(() => {
        expect(sessionService.deleteSession).toHaveBeenCalledWith('session-2')
      })
    })

    it('should have button to disconnect all other devices', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/tous les autres appareils/i)).toBeInTheDocument()
      })
    })

    it('should call deleteOtherSessions when clicking disconnect all', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        data: mockSessions,
        error: null,
      })
      vi.mocked(sessionService.deleteOtherSessions).mockResolvedValue({ error: null })

      renderSessionList()

      await waitFor(() => {
        expect(screen.getByText(/tous les autres appareils/i)).toBeInTheDocument()
      })

      const disconnectAllButton = screen.getByText(/tous les autres appareils/i)
      fireEvent.click(disconnectAllButton)

      await waitFor(() => {
        expect(sessionService.deleteOtherSessions).toHaveBeenCalledWith('session-1')
      })
    })
  })
})
