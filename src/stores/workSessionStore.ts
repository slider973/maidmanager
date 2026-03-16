/**
 * Work Session Store
 * Centralized state management for work sessions using SolidJS createStore
 */

import { createSignal, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { WorkSessionWithStaff, WorkSessionFilters } from '../lib/types/payments.types'
import * as workSessionService from '../services/work-session.service'

interface WorkSessionState {
  sessions: WorkSessionWithStaff[]
  loading: boolean
  error: string | null
  initialized: boolean
  filters: WorkSessionFilters
}

function createWorkSessionStore() {
  const [state, setState] = createStore<WorkSessionState>({
    sessions: [],
    loading: false,
    error: null,
    initialized: false,
    filters: {},
  })

  const [fetchPromise, setFetchPromise] = createSignal<Promise<void> | null>(null)

  const actions = {
    /**
     * Fetch all work sessions (with optional filters)
     */
    async fetch(filters?: WorkSessionFilters) {
      // Prevent duplicate fetches
      const existingPromise = fetchPromise()
      if (existingPromise) {
        return existingPromise
      }

      setState({ loading: true, error: null })

      if (filters) {
        setState({ filters })
      }

      const promise = (async () => {
        try {
          const result = await workSessionService.getWorkSessions(state.filters)

          if (result.error) {
            setState({ error: result.error, loading: false, initialized: true })
          } else {
            setState({ sessions: result.data || [], loading: false, error: null, initialized: true })
          }
        } catch (err) {
          setState({
            error: err instanceof Error ? err.message : 'Erreur inconnue',
            loading: false,
            initialized: true,
          })
        } finally {
          setFetchPromise(null)
        }
      })()

      setFetchPromise(promise)
      return promise
    },

    /**
     * Fetch work sessions for a specific staff member
     */
    async fetchByStaffMember(staffMemberId: string) {
      setState({ loading: true, error: null, filters: { staffMemberId } })

      try {
        const result = await workSessionService.getWorkSessionsByStaffMember(staffMemberId)

        if (result.error) {
          setState({ error: result.error, loading: false, initialized: true })
        } else {
          setState({ sessions: result.data || [], loading: false, error: null, initialized: true })
        }
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : 'Erreur inconnue',
          loading: false,
          initialized: true,
        })
      }
    },

    /**
     * Add a new work session
     */
    async add(data: Parameters<typeof workSessionService.createWorkSession>[0]) {
      const result = await workSessionService.createWorkSession(data)
      if (!result.error && result.data) {
        // Refetch to get the session with staff member data
        await actions.fetch(state.filters)
      }
      return result
    },

    /**
     * Update a work session
     */
    async update(id: string, data: Parameters<typeof workSessionService.updateWorkSession>[1]) {
      const result = await workSessionService.updateWorkSession(id, data)
      if (!result.error && result.data) {
        // Refetch to get updated data
        await actions.fetch(state.filters)
      }
      return result
    },

    /**
     * Delete a work session
     */
    async delete(id: string) {
      const result = await workSessionService.deleteWorkSession(id)
      if (!result.error) {
        setState('sessions', (sessions) => sessions.filter((s) => s.id !== id))
      }
      return result
    },

    /**
     * Set filters and refetch
     */
    async setFilters(filters: WorkSessionFilters) {
      setState({ filters })
      await actions.fetch(filters)
    },

    /**
     * Clear filters and refetch
     */
    async clearFilters() {
      setState({ filters: {} })
      await actions.fetch({})
    },

    /**
     * Reset store state
     */
    reset() {
      setState({
        sessions: [],
        loading: false,
        error: null,
        initialized: false,
        filters: {},
      })
      setFetchPromise(null)
    },
  }

  return { state, actions }
}

// Create singleton store
export const workSessionStore = createRoot(createWorkSessionStore)
