/**
 * StatsOverview Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { StatsOverview } from './StatsOverview'
import type { GlobalStats } from '../../lib/types/statistics.types'

const mockStats: GlobalStats = {
  totalScheduled: 10,
  completedScheduled: 8,
  cancelledScheduled: 1,
  scheduledCompletionRate: 77.78,
  totalTasks: 15,
  pendingTasks: 6,
  inProgressTasks: 3,
  completedTasks: 4,
  overdueTasks: 2,
  taskCompletionRate: 46.67,
  activeStaffCount: 5,
  totalStaffCount: 7,
}

const emptyStats: GlobalStats = {
  totalScheduled: 0,
  completedScheduled: 0,
  cancelledScheduled: 0,
  scheduledCompletionRate: 0,
  totalTasks: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  taskCompletionRate: 0,
  activeStaffCount: 0,
  totalStaffCount: 0,
}

describe('StatsOverview', () => {
  it('should show loading spinner when loading', () => {
    render(() => <StatsOverview stats={emptyStats} loading={true} />)

    expect(screen.getByText('Chargement des statistiques...')).toBeInTheDocument()
  })

  it('should display all global metrics', () => {
    render(() => <StatsOverview stats={mockStats} />)

    // Schedule metrics
    expect(screen.getByText('10')).toBeInTheDocument() // totalScheduled
    expect(screen.getByText('8')).toBeInTheDocument() // completedScheduled

    // Task metrics
    expect(screen.getByText('15')).toBeInTheDocument() // totalTasks
    expect(screen.getByText('6')).toBeInTheDocument() // pendingTasks
    expect(screen.getByText('2')).toBeInTheDocument() // overdueTasks

    // Staff metrics - activeStaffCount
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should show completion rates as percentages', () => {
    render(() => <StatsOverview stats={mockStats} />)

    // Should display completion rates
    expect(screen.getByText(/77\.78%/)).toBeInTheDocument()
    expect(screen.getByText(/46\.67%/)).toBeInTheDocument()
  })

  it('should have accessible grid structure', () => {
    const { container } = render(() => <StatsOverview stats={mockStats} />)

    // Should have stats grid
    const grid = container.querySelector('.stats-grid')
    expect(grid).toBeInTheDocument()

    // Should have multiple stat cards
    const cards = container.querySelectorAll('.stat-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('should display section headers', () => {
    render(() => <StatsOverview stats={mockStats} />)

    expect(screen.getByText('Interventions')).toBeInTheDocument()
    expect(screen.getByText('Missions')).toBeInTheDocument()
    expect(screen.getByText('Personnel')).toBeInTheDocument()
  })
})
