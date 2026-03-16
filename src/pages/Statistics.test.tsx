/**
 * Statistics Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@solidjs/testing-library'

// Mock router A component
vi.mock('@solidjs/router', () => ({
  A: (props: any) => <a href={props.href}>{props.children}</a>,
}))

// Mock stores before importing Statistics
vi.mock('../stores/staff.store', () => ({
  staffStore: {
    state: {
      members: [
        { id: 'staff-1', first_name: 'Marie', last_name: 'Dupont', position: 'housekeeper', is_active: true },
        { id: 'staff-2', first_name: 'Jean', last_name: 'Martin', position: 'gardener', is_active: true },
      ],
      loading: false,
      initialized: true,
    },
    actions: {
      fetch: vi.fn(),
    },
  },
}))

vi.mock('../stores/schedule.store', () => ({
  scheduleStore: {
    state: {
      entries: [
        { id: 'entry-1', staff_member_id: 'staff-1', scheduled_date: '2026-02-03', status: 'completed' },
        { id: 'entry-2', staff_member_id: 'staff-1', scheduled_date: '2026-02-04', status: 'scheduled' },
        { id: 'entry-3', staff_member_id: 'staff-2', scheduled_date: '2026-02-05', status: 'scheduled' },
      ],
      loading: false,
      initialized: true,
    },
    actions: {
      fetch: vi.fn(),
    },
  },
}))

vi.mock('../stores/task.store', () => ({
  taskStore: {
    state: {
      tasks: [
        { id: 'task-1', staff_member_id: 'staff-1', status: 'completed', due_date: '2026-02-03' },
        { id: 'task-2', staff_member_id: 'staff-2', status: 'pending', due_date: '2026-02-10' },
      ],
      loading: false,
      initialized: true,
    },
    actions: {
      fetch: vi.fn(),
    },
  },
}))

vi.mock('../lib/auth', () => ({
  useAuth: () => ({
    user: () => ({ email: 'test@example.com' }),
    session: () => ({ access_token: 'token' }),
    loading: () => false,
  }),
}))

import Statistics from './Statistics'

describe('Statistics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title', () => {
    render(() => <Statistics />)

    expect(screen.getByText('Statistiques')).toBeInTheDocument()
  })

  it('should render period filter', () => {
    render(() => <Statistics />)

    // Period filter buttons
    expect(screen.getByText('Cette semaine')).toBeInTheDocument()
    expect(screen.getByText('Ce mois')).toBeInTheDocument()
    expect(screen.getByText('Tout')).toBeInTheDocument()
  })

  it('should render stats overview section', () => {
    const { container } = render(() => <Statistics />)

    // Stats overview should have sections
    const statsOverview = container.querySelector('.stats-overview')
    expect(statsOverview).toBeInTheDocument()

    // Section titles exist (may appear multiple times across components)
    expect(screen.getAllByText('Interventions').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Missions').length).toBeGreaterThan(0)
    expect(screen.getByText('Personnel')).toBeInTheDocument()
  })

  it('should render staff stats section', () => {
    render(() => <Statistics />)

    // Staff stats header
    expect(screen.getByText('Statistiques par membre')).toBeInTheDocument()
  })

  it('should render activity chart section', () => {
    render(() => <Statistics />)

    // Activity chart header
    expect(screen.getByText("Évolution de l'activité")).toBeInTheDocument()
  })

  it('should render export button', () => {
    render(() => <Statistics />)

    expect(screen.getByRole('button', { name: /exporter/i })).toBeInTheDocument()
  })

  it('should have back link to home', () => {
    render(() => <Statistics />)

    const backLink = screen.getByRole('link', { name: /retour/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/')
  })
})
