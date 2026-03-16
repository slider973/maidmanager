/**
 * Task Store
 * Centralized state management for tasks/missions using SolidJS createStore
 */

import { createSignal, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type {
  TaskInsert,
  TaskUpdate,
  TaskWithStaff,
  TaskFilters,
  TaskStatus,
} from '../lib/types/task.types'
import * as taskService from '../services/task.service'

interface TaskState {
  tasks: TaskWithStaff[]
  loading: boolean
  error: string | null
  initialized: boolean
  filters: TaskFilters
}

function createTaskStore() {
  const [state, setState] = createStore<TaskState>({
    tasks: [],
    loading: false,
    error: null,
    initialized: false,
    filters: {},
  })

  const [fetchPromise, setFetchPromise] = createSignal<Promise<void> | null>(null)

  const actions = {
    /**
     * Fetch all tasks with current filters
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
          const result = await taskService.getTasks({
            filters: state.filters,
          })

          if (result.error) {
            setState({ error: result.error, loading: false, initialized: true })
          } else {
            setState({
              tasks: result.data || [],
              loading: false,
              error: null,
              initialized: true,
            })
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
     * Add a new task
     */
    async add(data: TaskInsert) {
      const result = await taskService.createTask(data)
      if (!result.error && result.data) {
        // Refetch to get the task with staff member data
        await this.fetch()
      }
      return result
    },

    /**
     * Update a task
     */
    async update(id: string, data: TaskUpdate) {
      const result = await taskService.updateTask(id, data)
      if (!result.error && result.data) {
        // Refetch to get the updated task with staff member data
        await this.fetch()
      }
      return result
    },

    /**
     * Delete a task
     */
    async delete(id: string) {
      const result = await taskService.deleteTask(id)
      if (!result.error) {
        setState('tasks', (tasks) => tasks.filter((t) => t.id !== id))
      }
      return result
    },

    /**
     * Update task status
     */
    async updateStatus(id: string, status: TaskStatus) {
      const result = await taskService.updateTaskStatus(id, status)
      if (!result.error) {
        setState('tasks', (task) => task.id === id, 'status', status)
      }
      return result
    },

    /**
     * Mark task as completed
     */
    async markAsCompleted(id: string) {
      return this.updateStatus(id, 'completed')
    },

    /**
     * Mark task as in progress
     */
    async markAsInProgress(id: string) {
      return this.updateStatus(id, 'in_progress')
    },

    /**
     * Mark task as pending
     */
    async markAsPending(id: string) {
      return this.updateStatus(id, 'pending')
    },

    /**
     * Set filters and refetch
     */
    setFilters(filters: Partial<TaskFilters>) {
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
      setState({
        tasks: [],
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
export const taskStore = createRoot(createTaskStore)
