/**
 * Session Management Service
 * Handles user session tracking and management
 */

import { api, ApiError } from '../lib/api'
import type { UserSession } from '../lib/types/database'

export interface SessionInfo {
  deviceInfo: string
  browser: string | null
  os: string | null
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Parse user agent to extract browser and OS info
 */
export function parseUserAgent(userAgent: string): SessionInfo {
  let browser: string | null = null
  let os: string | null = null

  // Parse browser
  if (userAgent.includes('Firefox/')) {
    const match = userAgent.match(/Firefox\/(\d+)/)
    browser = match ? `Firefox ${match[1]}` : 'Firefox'
  } else if (userAgent.includes('Edg/')) {
    const match = userAgent.match(/Edg\/(\d+)/)
    browser = match ? `Edge ${match[1]}` : 'Edge'
  } else if (userAgent.includes('Chrome/')) {
    const match = userAgent.match(/Chrome\/(\d+)/)
    browser = match ? `Chrome ${match[1]}` : 'Chrome'
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/)
    browser = match ? `Safari ${match[1]}` : 'Safari'
  }

  // Parse OS
  if (userAgent.includes('Windows NT 10')) {
    os = 'Windows 10/11'
  } else if (userAgent.includes('Windows NT')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    if (match) {
      const version = match[1].replace('_', '.')
      os = `macOS ${version}`
    } else {
      os = 'macOS'
    }
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android (\d+)/)
    os = match ? `Android ${match[1]}` : 'Android'
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    const match = userAgent.match(/OS (\d+)/)
    os = match ? `iOS ${match[1]}` : 'iOS'
  }

  return {
    deviceInfo: userAgent,
    browser,
    os,
  }
}

/**
 * Create a new session record for the current user
 */
export async function createSession(userId: string): Promise<{ data: UserSession | null; error: string | null }> {
  const sessionInfo = parseUserAgent(navigator.userAgent)

  try {
    const data = await api.post<UserSession>('/sessions', {
      user_id: userId,
      device_info: sessionInfo.deviceInfo,
      browser: sessionInfo.browser,
      os: sessionInfo.os,
      is_current: true,
    })
    return { data, error: null }
  } catch (err) {
    console.error('Failed to create session:', err)
    return { data: null, error: handleError(err) }
  }
}

/**
 * Get all sessions for the current user
 */
export async function getSessions(): Promise<{ data: UserSession[]; error: string | null }> {
  try {
    const data = await api.get<UserSession[]>('/sessions')
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get sessions:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Delete a specific session
 */
export async function deleteSession(sessionId: string): Promise<{ error: string | null }> {
  try {
    await api.delete(`/sessions/${sessionId}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete session:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete all sessions except the current one
 */
export async function deleteOtherSessions(currentSessionId: string): Promise<{ error: string | null }> {
  try {
    await api.delete(`/sessions/others/${currentSessionId}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete other sessions:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update last_active_at for the current session
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await api.put(`/sessions/${sessionId}/activity`)
  } catch {
    // Silently fail for activity updates
  }
}

/**
 * Create a debounced activity updater
 */
export function createActivityTracker(sessionId: string, debounceMs: number = 60000) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastUpdate = 0

  return () => {
    const now = Date.now()

    // Only update if enough time has passed
    if (now - lastUpdate < debounceMs) {
      return
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      updateSessionActivity(sessionId)
      lastUpdate = Date.now()
    }, 1000) // Small delay to batch rapid events
  }
}

/**
 * Format relative time in French
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return "À l'instant"
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }
}
