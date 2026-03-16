/**
 * Room Action Store
 * Feature: 009-staff-portal (US3)
 * Centralized state management for room actions using SolidJS createStore
 */

import { createSignal, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type {
  RoomType,
  ActionType,
  RoomActionWithRelations,
  RoomActionInsert,
} from '../lib/types/portal.types'
import * as referentialService from '../services/referential.service'
import * as roomActionService from '../services/room-action.service'

interface RoomActionState {
  roomTypes: RoomType[]
  actionTypes: ActionType[]
  todayActions: RoomActionWithRelations[]
  currentEntryActions: RoomActionWithRelations[]
  loading: boolean
  submitting: boolean
  error: string | null
  initialized: boolean
}

function createRoomActionStore() {
  const [state, setState] = createStore<RoomActionState>({
    roomTypes: [],
    actionTypes: [],
    todayActions: [],
    currentEntryActions: [],
    loading: false,
    submitting: false,
    error: null,
    initialized: false,
  })

  const [staffMemberId, setStaffMemberId] = createSignal<string | null>(null)
  const [staffPosition, setStaffPosition] = createSignal<string | null>(null)
  const [currentTimeEntryId, setCurrentTimeEntryId] = createSignal<string | null>(null)

  const actions = {
    /**
     * Initialize store for a staff member
     */
    async init(staffId: string, position: string) {
      if (staffMemberId() === staffId && state.initialized) {
        return
      }

      setStaffMemberId(staffId)
      setStaffPosition(position)
      setState({ loading: true, error: null })

      try {
        // Fetch room types and action types in parallel
        const [roomTypesResult, actionTypesResult, todayResult] = await Promise.all([
          referentialService.getRoomTypes(),
          referentialService.getActionTypesForPosition(position),
          roomActionService.getTodayActions(staffId),
        ])

        setState({
          roomTypes: roomTypesResult.data,
          actionTypes: actionTypesResult.data,
          todayActions: todayResult.data,
          loading: false,
          initialized: true,
          error: roomTypesResult.error || actionTypesResult.error || todayResult.error || null,
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
     * Set current time entry context
     */
    async setCurrentEntry(timeEntryId: string | null) {
      setCurrentTimeEntryId(timeEntryId)

      if (!timeEntryId) {
        setState({ currentEntryActions: [] })
        return
      }

      setState({ loading: true, error: null })

      try {
        const result = await roomActionService.getActionsForEntry(timeEntryId)

        setState({
          currentEntryActions: result.data,
          loading: false,
          error: result.error,
        })
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : 'Erreur inconnue',
          loading: false,
        })
      }
    },

    /**
     * Add a new room action
     */
    async addAction(
      roomTypeId: string,
      actionTypeId: string,
      notes?: string,
      clientRoomId?: string
    ): Promise<{ success: boolean; error?: string }> {
      const timeEntryId = currentTimeEntryId()
      if (!timeEntryId) {
        return { success: false, error: 'Pas de pointage en cours' }
      }

      setState({ submitting: true, error: null })

      try {
        const actionData: RoomActionInsert = {
          time_entry_id: timeEntryId,
          room_type_id: roomTypeId,
          action_type_id: actionTypeId,
          client_room_id: clientRoomId || null,
          notes: notes || undefined,
        }

        const result = await roomActionService.createRoomAction(actionData)

        if (result.error) {
          setState({ submitting: false, error: result.error })
          return { success: false, error: result.error }
        }

        // Refresh both today's actions and current entry actions
        await actions.refresh()
        setState({ submitting: false })
        return { success: true }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Erreur inconnue'
        setState({ submitting: false, error })
        return { success: false, error }
      }
    },

    /**
     * Delete a room action
     */
    async deleteAction(actionId: string): Promise<{ success: boolean; error?: string }> {
      setState({ submitting: true, error: null })

      try {
        const result = await roomActionService.deleteRoomAction(actionId)

        if (result.error) {
          setState({ submitting: false, error: result.error })
          return { success: false, error: result.error }
        }

        // Refresh both today's actions and current entry actions
        await actions.refresh()
        setState({ submitting: false })
        return { success: true }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Erreur inconnue'
        setState({ submitting: false, error })
        return { success: false, error }
      }
    },

    /**
     * Refresh actions data
     */
    async refresh() {
      const staffId = staffMemberId()
      const timeEntryId = currentTimeEntryId()

      if (!staffId) return

      setState({ loading: true, error: null })

      try {
        const promises: Promise<any>[] = [roomActionService.getTodayActions(staffId)]

        if (timeEntryId) {
          promises.push(roomActionService.getActionsForEntry(timeEntryId))
        }

        const results = await Promise.all(promises)

        setState({
          todayActions: results[0].data,
          currentEntryActions: timeEntryId ? results[1].data : [],
          loading: false,
          error: results[0].error || (timeEntryId ? results[1].error : null) || null,
        })
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
      setStaffPosition(null)
      setCurrentTimeEntryId(null)
      setState({
        roomTypes: [],
        actionTypes: [],
        todayActions: [],
        currentEntryActions: [],
        loading: false,
        submitting: false,
        error: null,
        initialized: false,
      })
    },
  }

  return {
    state,
    actions,
    staffMemberId,
    staffPosition,
    currentTimeEntryId,
  }
}

// Create singleton store
export const roomActionStore = createRoot(createRoomActionStore)
