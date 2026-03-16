/**
 * TaskCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { TaskCard } from './TaskCard'
import type { TaskWithStaff } from '../../lib/types/task.types'

describe('TaskCard', () => {
  const mockTask: TaskWithStaff = {
    id: 'task-1',
    user_id: 'user-1',
    staff_member_id: 'staff-1',
    title: 'Nettoyer les vitres',
    description: 'Toutes les fenêtres du salon',
    due_date: '2026-02-15',
    priority: 'high',
    status: 'pending',
    notes: 'Utiliser le produit bio',
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
    staff_member: {
      id: 'staff-1',
      first_name: 'Marie',
      last_name: 'Dupont',
      position: 'housekeeper',
    },
  }

  it('should display task title', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('Nettoyer les vitres')).toBeInTheDocument()
  })

  it('should display task description', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('Toutes les fenêtres du salon')).toBeInTheDocument()
  })

  it('should display staff member name', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
  })

  it('should display staff member position', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('Femme de ménage')).toBeInTheDocument()
  })

  it('should display priority badge', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('Haute')).toBeInTheDocument()
  })

  it('should display status badge', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('should display notes', () => {
    render(() => <TaskCard task={mockTask} />)
    expect(screen.getByText('Utiliser le produit bio')).toBeInTheDocument()
  })

  it('should display "Membre supprimé" when staff_member is null', () => {
    const taskWithoutStaff: TaskWithStaff = {
      ...mockTask,
      staff_member_id: null,
      staff_member: null,
    }
    render(() => <TaskCard task={taskWithoutStaff} />)
    expect(screen.getByText('Membre supprimé')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(() => <TaskCard task={mockTask} onEdit={onEdit} />)

    const editButton = screen.getByText('Modifier')
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('should call onStatusChange when status button is clicked', () => {
    const onStatusChange = vi.fn()
    render(() => <TaskCard task={mockTask} onStatusChange={onStatusChange} />)

    const completeButton = screen.getByText('Terminé')
    fireEvent.click(completeButton)

    expect(onStatusChange).toHaveBeenCalledWith(mockTask, 'completed')
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(() => <TaskCard task={mockTask} onDelete={onDelete} />)

    const deleteButton = screen.getByText('Supprimer')
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockTask)
  })

  it('should show "Réouvrir" button for completed tasks', () => {
    const completedTask: TaskWithStaff = {
      ...mockTask,
      status: 'completed',
    }
    const onStatusChange = vi.fn()
    render(() => <TaskCard task={completedTask} onStatusChange={onStatusChange} />)

    expect(screen.getByText('Réouvrir')).toBeInTheDocument()
  })

  it('should show "En cours" button for pending tasks', () => {
    const onStatusChange = vi.fn()
    render(() => <TaskCard task={mockTask} onStatusChange={onStatusChange} />)

    expect(screen.getByText('En cours')).toBeInTheDocument()
  })

  it('should apply overdue class for overdue tasks', () => {
    // Create a task with due_date in the past
    const overdueTask: TaskWithStaff = {
      ...mockTask,
      due_date: '2020-01-01', // Past date
    }
    const { container } = render(() => <TaskCard task={overdueTask} />)

    expect(container.querySelector('.task-card-overdue')).toBeInTheDocument()
  })

  it('should show "En retard" badge for overdue tasks', () => {
    const overdueTask: TaskWithStaff = {
      ...mockTask,
      due_date: '2020-01-01', // Past date
    }
    render(() => <TaskCard task={overdueTask} />)

    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  it('should apply completed class for completed tasks', () => {
    const completedTask: TaskWithStaff = {
      ...mockTask,
      status: 'completed',
    }
    const { container } = render(() => <TaskCard task={completedTask} />)

    expect(container.querySelector('.task-card-completed')).toBeInTheDocument()
  })
})
