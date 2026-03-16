/**
 * TaskForm Component
 * Form for adding or editing a task/mission
 */

import { createSignal, Show, For, onMount, createEffect } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import {
  createTask,
  updateTask,
  validateTask,
} from '../../services/task.service'
import { getStaffMembers } from '../../services/staff.service'
import { showSuccess } from '../ui/Toast'
import type { StaffMember } from '../../lib/types/database'
import {
  TASK_PRIORITIES,
  PRIORITY_LABELS,
  type TaskWithStaff,
  type TaskPriority,
} from '../../lib/types/task.types'

interface TaskFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: TaskWithStaff
  mode?: 'create' | 'edit'
}

export const TaskForm: Component<TaskFormProps> = (props) => {
  const [staffMembers, setStaffMembers] = createSignal<StaffMember[]>([])
  const [staffMemberId, setStaffMemberId] = createSignal('')
  const [title, setTitle] = createSignal('')
  const [description, setDescription] = createSignal('')
  const [dueDate, setDueDate] = createSignal('')
  const [priority, setPriority] = createSignal<TaskPriority>('normal')
  const [notes, setNotes] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [loadingStaff, setLoadingStaff] = createSignal(true)

  const isEditMode = () => props.mode === 'edit'

  // Fetch staff members on mount
  onMount(async () => {
    const result = await getStaffMembers({ isActive: true })
    if (!result.error && result.data) {
      setStaffMembers(result.data)
    }
    setLoadingStaff(false)
  })

  // Populate form with initial data when in edit mode
  createEffect(() => {
    if (props.initialData && isEditMode()) {
      setStaffMemberId(props.initialData.staff_member_id || '')
      setTitle(props.initialData.title)
      setDescription(props.initialData.description || '')
      setDueDate(props.initialData.due_date)
      setPriority(props.initialData.priority)
      setNotes(props.initialData.notes || '')
    }
  })

  const resetForm = () => {
    setStaffMemberId('')
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('normal')
    setNotes('')
    setError('')
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    const data = {
      staff_member_id: staffMemberId(),
      title: title(),
      description: description() || null,
      due_date: dueDate(),
      priority: priority(),
      notes: notes() || null,
    }

    // Client-side validation
    const validationError = validateTask(data)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    let result
    if (isEditMode() && props.initialData) {
      result = await updateTask(props.initialData.id, data)
    } else {
      result = await createTask(data)
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
    showSuccess(isEditMode() ? 'Mission modifiée avec succès' : 'Mission créée avec succès')
    props.onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} class="task-form">
      <Show when={error()}>
        <div class="error-message">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span class="error-text">{error()}</span>
        </div>
      </Show>

      <div class="form-group">
        <label class="form-label" for="task-staff-member">
          Membre du personnel
        </label>
        <Show
          when={!loadingStaff()}
          fallback={
            <select class="form-input form-select" disabled>
              <option>Chargement...</option>
            </select>
          }
        >
          <select
            class="form-input form-select"
            id="task-staff-member"
            value={staffMemberId()}
            onChange={(e) => setStaffMemberId(e.currentTarget.value)}
            required
          >
            <option value="">Sélectionner un membre</option>
            <For each={staffMembers()}>
              {(staff) => (
                <option value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              )}
            </For>
          </select>
        </Show>
      </div>

      <div class="form-group">
        <label class="form-label" for="task-title">
          Titre de la mission
        </label>
        <input
          class="form-input"
          id="task-title"
          type="text"
          placeholder="Ex: Nettoyer les vitres"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          maxLength={200}
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="task-due-date">
            Date d'échéance
          </label>
          <input
            class="form-input"
            id="task-due-date"
            type="date"
            value={dueDate()}
            onInput={(e) => setDueDate(e.currentTarget.value)}
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="task-priority">
            Priorité
          </label>
          <select
            class="form-input form-select"
            id="task-priority"
            value={priority()}
            onChange={(e) => setPriority(e.currentTarget.value as TaskPriority)}
          >
            <For each={TASK_PRIORITIES}>
              {(p) => (
                <option value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              )}
            </For>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="task-description">
          Description (optionnel)
        </label>
        <textarea
          class="form-input form-textarea"
          id="task-description"
          placeholder="Détails sur la mission..."
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          rows={3}
          maxLength={1000}
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="task-notes">
          Notes (optionnel)
        </label>
        <textarea
          class="form-input form-textarea"
          id="task-notes"
          placeholder="Notes additionnelles..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />
      </div>

      <div class="form-actions">
        <LoadingButton
          type="submit"
          class="btn-primary"
          loading={loading()}
          loadingText={isEditMode() ? 'Modification en cours...' : 'Création en cours...'}
        >
          {isEditMode() ? 'Modifier la mission' : 'Créer la mission'}
        </LoadingButton>

        <Show when={isEditMode() && props.onCancel}>
          <button type="button" class="btn btn-secondary" onClick={props.onCancel}>
            Annuler
          </button>
        </Show>
      </div>
    </form>
  )
}
