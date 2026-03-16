/**
 * Schedule Store
 * Centralized state management for schedule entries using SolidJS createStore
 */

import { createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type {
  ScheduleEntryInsert,
  ScheduleEntryUpdate,
  ScheduleEntryWithStaff,
  ScheduleFilters,
} from '../lib/types/database'
import * as scheduleService from '../services/schedule.service'

interface ScheduleState {
  entries: ScheduleEntryWithStaff[]
  loading: boolean
  error: string | null
  initialized: boolean
  filters: ScheduleFilters
}

function createScheduleStore() {
  const [state, setState] = createStore<ScheduleState>({
    entries: [],
    loading: false,
    error: null,
    initialized: false,
    filters: {},
  })

  let fetchId = 0

  const actions = {
    /**
     * Fetch all schedule entries with current filters
     */
    async fetch() {
      // Use fetchId to handle concurrent fetches - only apply the latest result
      const currentFetchId = ++fetchId

      setState({ loading: true, error: null })

      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 15000)
        })

        const result = await Promise.race([
          scheduleService.getScheduleEntries({ filters: state.filters }),
          timeoutPromise
        ])

        // Only update state if this is still the latest fetch
        if (currentFetchId !== fetchId) return

        if (result.error) {
          setState({ error: result.error, loading: false, initialized: true })
        } else {
          setState({
            entries: result.data || [],
            loading: false,
            error: null,
            initialized: true,
          })
        }
      } catch (err) {
        // Only update state if this is still the latest fetch
        if (currentFetchId !== fetchId) return

        const message = err instanceof Error && err.message === 'Timeout'
          ? 'Le chargement a pris trop de temps. Veuillez reessayer.'
          : 'Erreur de chargement'
        setState({
          error: message,
          loading: false,
          initialized: true,
        })
      }
    },

    /**
     * Add a new schedule entry
     */
    async add(data: ScheduleEntryInsert) {
      const result = await scheduleService.createScheduleEntry(data)
      if (!result.error && result.data) {
        // Refetch to get the entry with staff member data
        await this.fetch()
      }
      return result
    },

    /**
     * Update a schedule entry
     */
    async update(id: string, data: ScheduleEntryUpdate) {
      const result = await scheduleService.updateScheduleEntry(id, data)
      if (!result.error && result.data) {
        // Refetch to get the updated entry with staff member data
        await this.fetch()
      }
      return result
    },

    /**
     * Delete a schedule entry
     */
    async delete(id: string) {
      const result = await scheduleService.deleteScheduleEntry(id)
      if (!result.error) {
        setState('entries', (entries) => entries.filter((e) => e.id !== id))
      }
      return result
    },

    /**
     * Mark entry as completed
     */
    async markAsCompleted(id: string) {
      const result = await scheduleService.updateScheduleStatus(id, 'completed')
      if (!result.error) {
        setState('entries', (entry) => entry.id === id, 'status', 'completed')
      }
      return result
    },

    /**
     * Mark entry as cancelled
     */
    async markAsCancelled(id: string) {
      const result = await scheduleService.updateScheduleStatus(id, 'cancelled')
      if (!result.error) {
        setState('entries', (entry) => entry.id === id, 'status', 'cancelled')
      }
      return result
    },

    /**
     * Set filters and refetch
     */
    setFilters(filters: Partial<ScheduleFilters>) {
      setState('filters', (current) => ({ ...current, ...filters }))
      this.fetch()
    },

    /**
     * Clear all filters and refetch
     */
    clearFilters() {
      setState('filters', {})
      this.fetch()
    },

    /**
     * Reset store state
     */
    reset() {
      fetchId++ // Cancel any in-flight fetches
      setState({
        entries: [],
        loading: false,
        error: null,
        initialized: false,
        filters: {},
      })
    },
  }

  return { state, actions }
}

// Create singleton store
export const scheduleStore = createRoot(createScheduleStore)
