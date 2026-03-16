/**
 * Staff Store
 * Centralized state management for staff members using SolidJS createStore
 */

import { createSignal, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { StaffMember } from '../lib/types/database'
import * as staffService from '../services/staff.service'

interface StaffState {
  members: StaffMember[]
  loading: boolean
  error: string | null
  initialized: boolean
}

function createStaffStore() {
  const [state, setState] = createStore<StaffState>({
    members: [],
    loading: false,
    error: null,
    initialized: false,
  })

  const [fetchPromise, setFetchPromise] = createSignal<Promise<void> | null>(null)

  const actions = {
    /**
     * Fetch all staff members
     */
    async fetch() {
      // Prevent duplicate fetches
      const existingPromise = fetchPromise()
      if (existingPromise) {
        return existingPromise
      }

      setState({ loading: true, error: null })

      const promise = (async () => {
        try {
          const result = await staffService.getStaffMembers()

          if (result.error) {
            setState({ error: result.error, loading: false, initialized: true })
          } else {
            setState({ members: result.data || [], loading: false, error: null, initialized: true })
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
     * Add a new staff member
     */
    async add(data: Parameters<typeof staffService.createStaffMember>[0]) {
      const result = await staffService.createStaffMember(data)
      if (!result.error && result.data) {
        setState('members', (members) => [result.data!, ...members])
      }
      return result
    },

    /**
     * Delete a staff member
     */
    async delete(id: string) {
      const result = await staffService.deleteStaffMember(id)
      if (!result.error) {
        setState('members', (members) => members.filter((m) => m.id !== id))
      }
      return result
    },

    /**
     * Reset store state
     */
    reset() {
      setState({
        members: [],
        loading: false,
        error: null,
        initialized: false,
      })
      setFetchPromise(null)
    },
  }

  return { state, actions }
}

// Create singleton store
export const staffStore = createRoot(createStaffStore)
