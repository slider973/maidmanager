/**
 * TaskList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { TaskList } from './TaskList'
import { taskStore } from '../../stores/task.store'
import type { TaskWithStaff } from '../../lib/types/task.types'

// Mock the task store
vi.mock('../../stores/task.store', () => ({
  taskStore: {
    state: {
      tasks: [],
      loading: false,
      error: null,
      initialized: false,
      filters: {},
    },
    actions: {
      fetch: vi.fn(),
    },
  },
}))

describe('TaskList', () => {
  const mockTasks: TaskWithStaff[] = [
    {
      id: 'task-1',
      user_id: 'user-1',
      staff_member_id: 'staff-1',
      title: 'Nettoyer les vitres',
      description: null,
      due_date: '2026-02-10',
      priority: 'normal',
      status: 'pending',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: {
        id: 'staff-1',
        first_name: 'Marie',
        last_name: 'Dupont',
        position: 'housekeeper',
      },
    },
    {
      id: 'task-2',
      user_id: 'user-1',
      staff_member_id: 'staff-2',
      title: 'Tailler les haies',
      description: null,
      due_date: '2026-02-11',
      priority: 'high',
      status: 'pending',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: {
        id: 'staff-2',
        first_name: 'Jean',
        last_name: 'Martin',
        position: 'gardener',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    ;(taskStore as any).state = {
      tasks: [],
      loading: false,
      error: null,
      initialized: false,
      filters: {},
    }
  })

  it('should show loading spinner when loading', () => {
    ;(taskStore as any).state = {
      ...taskStore.state,
      loading: true,
    }

    render(() => <TaskList />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should show error message when error', () => {
    ;(taskStore as any).state = {
      ...taskStore.state,
      loading: false,
      error: 'Échec du chargement',
      initialized: true,
    }

    render(() => <TaskList />)
    expect(screen.getByText('Échec du chargement')).toBeInTheDocument()
  })

  it('should show empty state when no tasks', () => {
    ;(taskStore as any).state = {
      ...taskStore.state,
      loading: false,
      error: null,
      initialized: true,
      tasks: [],
    }

    render(() => <TaskList />)
    expect(screen.getByText('Aucune mission')).toBeInTheDocument()
  })

  it('should show CTA button in empty state when onCreateNew is provided', () => {
    const onCreateNew = vi.fn()
    ;(taskStore as any).state = {
      ...taskStore.state,
      loading: false,
      error: null,
      initialized: true,
      tasks: [],
    }

    render(() => <TaskList onCreateNew={onCreateNew} />)
    expect(screen.getByText('Créer une mission')).toBeInTheDocument()
  })

  it('should render tasks when available', () => {
    ;(taskStore as any).state = {
      ...taskStore.state,
      loading: false,
      error: null,
      initialized: true,
      tasks: mockTasks,
    }

    render(() => <TaskList />)
    expect(screen.getByText('Nettoyer les vitres')).toBeInTheDocument()
    expect(screen.getByText('Tailler les haies')).toBeInTheDocument()
  })

  it('should call fetch on mount if not initialized', () => {
    ;(taskStore as any).state = {
      ...taskStore.state,
      initialized: false,
      loading: false,
    }

    render(() => <TaskList />)
    expect(taskStore.actions.fetch).toHaveBeenCalled()
  })

  it('should not call fetch on mount if already initialized', () => {
    ;(taskStore as any).state = {
      ...taskStore.state,
      initialized: true,
      loading: false,
    }

    render(() => <TaskList />)
    expect(taskStore.actions.fetch).not.toHaveBeenCalled()
  })
})
