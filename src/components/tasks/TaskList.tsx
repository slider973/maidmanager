/**
 * TaskList Component
 * Displays a list of tasks/missions
 */

import { Show, For, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { taskStore } from '../../stores/task.store'
import { TaskCard } from './TaskCard'
import type { TaskWithStaff, TaskStatus } from '../../lib/types/task.types'

interface TaskListProps {
  onEdit?: (task: TaskWithStaff) => void
  onDelete?: (task: TaskWithStaff) => void
  onStatusChange?: (task: TaskWithStaff, status: TaskStatus) => void
  onCreateNew?: () => void
}

export const TaskList: Component<TaskListProps> = (props) => {
  const { state, actions } = taskStore

  // Fetch on mount if not already initialized
  onMount(() => {
    if (!state.initialized && !state.loading) {
      actions.fetch()
    }
  })

  return (
    <div class="task-list">
      <Show when={state.loading}>
        <div class="task-loading">
          <span class="loading-spinner" />
          <span>Chargement...</span>
        </div>
      </Show>

      <Show when={!state.loading && state.error}>
        <div class="task-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
        </div>
      </Show>

      <Show when={!state.loading && !state.error && state.initialized}>
        <Show
          when={state.tasks.length > 0}
          fallback={
            <div class="task-empty">
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3 class="empty-state-title">Aucune mission</h3>
              <p class="empty-state-text">
                Créez votre première mission en utilisant le formulaire ci-dessus.
              </p>
              <Show when={props.onCreateNew}>
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={props.onCreateNew}
                >
                  Créer une mission
                </button>
              </Show>
            </div>
          }
        >
          <div class="task-grid">
            <For each={state.tasks}>
              {(task) => (
                <TaskCard
                  task={task}
                  onEdit={props.onEdit}
                  onDelete={props.onDelete}
                  onStatusChange={props.onStatusChange}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  )
}
