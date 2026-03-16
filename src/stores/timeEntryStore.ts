/**
 * Time Entry Store
 * Feature: 009-staff-portal (US2)
 * Centralized state management for time entries using SolidJS createStore
 */

import { createSignal, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type {
  TimeEntry,
  TimeEntryWithRelations,
  ClockInRequest,
  ClockOutRequest,
} from '../lib/types/portal.types'
import * as timeEntryService from '../services/time-entry.service'

interface TimeEntryState {
  currentEntry: TimeEntryWithRelations | null
  missingEntries: TimeEntryWithRelations[]
  historyEntries: TimeEntryWithRelations[]
  loading: boolean
  clockingIn: boolean
  clockingOut: boolean
  error: string | null
  initialized: boolean
}

function createTimeEntryStore() {
  const [state, setState] = createStore<TimeEntryState>({
    currentEntry: null,
    missingEntries: [],
    historyEntries: [],
    loading: false,
    clockingIn: false,
    clockingOut: false,
    error: null,
    initialized: false,
  })

  const [staffMemberId, setStaffMemberId] = createSignal<string | null>(null)

  const actions = {
    /**
     * Initialize store for a staff member
     */
    async init(staffId: string) {
      if (staffMemberId() === staffId && state.initialized) {
        return
      }

      setStaffMemberId(staffId)
      setState({ loading: true, error: null })

      try {
        // Fetch current entry and missing entries in parallel
        const [currentResult, missingResult] = await Promise.all([
          timeEntryService.getCurrentEntry(staffId),
          timeEntryService.getMissingEntries(staffId),
        ])

        setState({
          currentEntry: currentResult.data,
          missingEntries: missingResult.data,
          loading: false,
          initialized: true,
          error: currentResult.error || missingResult.error || null,
        })
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : 'Erreur inconnue',
          loading: false,
          initialized: true,
        })
      }
    },

    /**
     * Refresh current entry status
     */
    async refresh() {
      const staffId = staffMemberId()
      if (!staffId) return

      setState({ loading: true, error: null })

      try {
        const [currentResult, missingResult] = await Promise.all([
          timeEntryService.getCurrentEntry(staffId),
          timeEntryService.getMissingEntries(staffId),
        ])

        setState({
          currentEntry: currentResult.data,
          missingEntries: missingResult.data,
          loading: false,
          error: currentResult.error || missingResult.error || null,
        })
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : 'Erreur inconnue',
          loading: false,
        })
      }
    },

    /**
     * Clock in
     */
    async clockIn(request: ClockInRequest): Promise<{ success: boolean; error?: string }> {
      const staffId = staffMemberId()
      if (!staffId) {
        return { success: false, error: 'Non initialise' }
      }

      setState({ clockingIn: true, error: null })

      try {
        const result = await timeEntryService.clockIn(staffId, request)

        if (result.error) {
          setState({ clockingIn: false, error: result.error })
          return { success: false, error: result.error }
        }

        // Refresh to get the full entry with relations
        await actions.refresh()
        setState({ clockingIn: false })
        return { success: true }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Erreur inconnue'
        setState({ clockingIn: false, error })
        return { success: false, error }
      }
    },

    /**
     * Clock out
     */
    async clockOut(request?: ClockOutRequest): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
      const staffId = staffMemberId()
      if (!staffId) {
        return { success: false, error: 'Non initialise' }
      }

      setState({ clockingOut: true, error: null })

      try {
        const result = await timeEntryService.clockOut(staffId, request)

        if (result.error) {
          setState({ clockingOut: false, error: result.error })
          return { success: false, error: result.error }
        }

        // Clear current entry and refresh
        setState({ currentEntry: null })
        await actions.refresh()
        setState({ clockingOut: false })
        return { success: true, data: result.data }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Erreur inconnue'
        setState({ clockingOut: false, error })
        return { success: false, error }
      }
    },

    /**
     * Fetch history for a date range
     */
    async fetchHistory(dateFrom: string, dateTo: string) {
      const staffId = staffMemberId()
      if (!staffId) return

      setState({ loading: true, error: null })

      try {
        const result = await timeEntryService.getHistory(staffId, dateFrom, dateTo)

        if (result.error) {
          setState({ loading: false, error: result.error })
        } else {
          setState({ historyEntries: result.data, loading: false })
        }
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : 'Erreur inconnue',
          loading: false,
        })
      }
    },

    /**
     * Clear error
     */
    clearError() {
      setState({ error: null })
    },

    /**
     * Reset store
     */
    reset() {
      setStaffMemberId(null)
      setState({
        currentEntry: null,
        missingEntries: [],
        historyEntries: [],
        loading: false,
        clockingIn: false,
        clockingOut: false,
        error: null,
        initialized: false,
      })
    },
  }

  return { state, actions, staffMemberId }
}

// Create singleton store
export const timeEntryStore = createRoot(createTimeEntryStore)
