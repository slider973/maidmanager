/**
 * Session Management Service
 * Handles user session tracking and management
 */

import { supabase } from '../lib/supabase'
import type { UserSession, UserSessionInsert } from '../lib/types/database'

export interface SessionInfo {
  deviceInfo: string
  browser: string | null
  os: string | null
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

  // First, mark all other sessions as not current
  await supabase
    .from('user_sessions')
    .update({ is_current: false })
    .eq('user_id', userId)

  const sessionData: UserSessionInsert = {
    user_id: userId,
    device_info: sessionInfo.deviceInfo,
    browser: sessionInfo.browser,
    os: sessionInfo.os,
    is_current: true,
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create session:', error)
    return { data: null, error: 'Erreur lors de la création de la session' }
  }

  return { data, error: null }
}

/**
 * Get all sessions for the current user
 */
export async function getSessions(): Promise<{ data: UserSession[]; error: string | null }> {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .order('last_active_at', { ascending: false })

  if (error) {
    console.error('Failed to get sessions:', error)
    return { data: [], error: 'Erreur lors de la récupération des sessions' }
  }

  return { data: data || [], error: null }
}

/**
 * Delete a specific session
 */
export async function deleteSession(sessionId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('Failed to delete session:', error)
    return { error: 'Erreur lors de la suppression de la session' }
  }

  return { error: null }
}

/**
 * Delete all sessions except the current one
 */
export async function deleteOtherSessions(currentSessionId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .neq('id', currentSessionId)

  if (error) {
    console.error('Failed to delete other sessions:', error)
    return { error: 'Erreur lors de la déconnexion des autres appareils' }
  }

  return { error: null }
}

/**
 * Update last_active_at for the current session
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  await supabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', sessionId)
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
