/**
 * Tasks Page
 * Main page for task/mission management
 */

import { createEffect, createSignal, on, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskList } from '../components/tasks/TaskList'
import { TaskFilters } from '../components/tasks/TaskFilters'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { showSuccess, showError } from '../components/ui/Toast'
import { taskStore } from '../stores/task.store'
import type { TaskWithStaff, TaskFilters as TaskFiltersType, TaskStatus } from '../lib/types/task.types'

export default function Tasks() {
  const { user, session, loading, signOut } = useAuth()
  const { state, actions } = taskStore

  // Edit state
  const [editingTask, setEditingTask] = createSignal<TaskWithStaff | null>(null)

  // Delete confirmation state
  const [deleteTask, setDeleteTask] = createSignal<TaskWithStaff | null>(null)
  const [deleteLoading, setDeleteLoading] = createSignal(false)

  // Fetch tasks when auth is ready (session exists and not loading)
  createEffect(
    on(
      () => ({ loading: loading(), session: session() }),
      ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          actions.fetch()
        }
      }
    )
  )

  const getInitials = () => {
    const email = user()?.email || ''
    return email.charAt(0).toUpperCase()
  }

  const handleSuccess = () => {
    setEditingTask(null)
    actions.fetch()
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
  }

  const handleEdit = (task: TaskWithStaff) => {
    setEditingTask(task)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (task: TaskWithStaff) => {
    setDeleteTask(task)
  }

  const confirmDelete = async () => {
    const task = deleteTask()
    if (!task) return

    setDeleteLoading(true)
    const result = await actions.delete(task.id)
    setDeleteLoading(false)

    if (result.error) {
      showError(result.error)
    } else {
      showSuccess('Mission supprimée avec succès')
    }
    setDeleteTask(null)
  }

  const handleStatusChange = async (task: TaskWithStaff, status: TaskStatus) => {
    const result = await actions.updateStatus(task.id, status)
    if (result.error) {
      showError(result.error)
    } else {
      const statusMessages: Record<TaskStatus, string> = {
        pending: 'Mission réouverte',
        in_progress: 'Mission marquée en cours',
        completed: 'Mission terminée',
      }
      showSuccess(statusMessages[status])
    }
  }

  const handleFiltersChange = (filters: Partial<TaskFiltersType>) => {
    actions.setFilters(filters)
  }

  const handleClearFilters = () => {
    actions.clearFilters()
  }

  return (
    <div class="dashboard">
      {/* Header */}
      <header class="dashboard-header">
        <div class="header-brand">
          <A href="/" class="header-brand-link">
            <div class="header-logo">M</div>
            <span class="header-title">MaidManager</span>
          </A>
        </div>

        <div class="header-actions">
          <div class="user-menu">
            <div class="user-avatar">{getInitials()}</div>
            <div class="user-info">
              <span class="user-name">Mon compte</span>
              <span class="user-email">{user()?.email}</span>
            </div>
          </div>
          <button class="btn btn-ghost" onClick={() => signOut()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main class="dashboard-main">
        {/* Page Header */}
        <div class="page-header">
          <div class="page-header-content">
            <A href="/" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Retour
            </A>
            <h1 class="page-title">Missions</h1>
            <p class="page-subtitle">Assignez et suivez les tâches de votre personnel</p>
          </div>
        </div>

        {/* Tasks Content */}
        <div class="task-layout">
          {/* Add/Edit Task Form */}
          <section class="task-form-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <Show when={!editingTask()}>
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </Show>
                  </svg>
                  {editingTask() ? 'Modifier la mission' : 'Nouvelle mission'}
                </h2>
              </div>
              <div class="section-card-body">
                <Show
                  when={editingTask()}
                  fallback={<TaskForm onSuccess={handleSuccess} />}
                >
                  <TaskForm
                    mode="edit"
                    initialData={editingTask()!}
                    onSuccess={handleSuccess}
                    onCancel={handleCancelEdit}
                  />
                </Show>
              </div>
            </div>
          </section>

          {/* Task List */}
          <section class="task-list-section">
            <div class="section-card">
              <div class="section-card-header">
                <h2 class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  Liste des missions
                </h2>
              </div>
              <div class="section-card-body">
                <TaskFilters
                  filters={state.filters}
                  onFiltersChange={handleFiltersChange}
                  onClear={handleClearFilters}
                />
                <TaskList
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTask()}
        title="Supprimer la mission"
        message={`Êtes-vous sûr de vouloir supprimer la mission "${deleteTask()?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteLoading()}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTask(null)}
        confirmVariant="danger"
      />
    </div>
  )
}
