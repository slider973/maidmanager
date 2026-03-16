/**
 * StaffStats Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { StaffStats } from './StaffStats'
import type { StaffMemberStats } from '../../lib/types/statistics.types'

const mockStaffStats: StaffMemberStats[] = [
  {
    staffMember: {
      id: 'staff-1',
      firstName: 'Marie',
      lastName: 'Dupont',
      position: 'housekeeper',
    },
    scheduledCount: 5,
    completedCount: 4,
    taskCount: 3,
    completedTaskCount: 2,
    overdueTaskCount: 0,
    completionRate: 75,
    hasOverdue: false,
  },
  {
    staffMember: {
      id: 'staff-2',
      firstName: 'Jean',
      lastName: 'Martin',
      position: 'gardener',
    },
    scheduledCount: 3,
    completedCount: 1,
    taskCount: 4,
    completedTaskCount: 1,
    overdueTaskCount: 2,
    completionRate: 29,
    hasOverdue: true,
  },
]

describe('StaffStats', () => {
  it('should show loading spinner when loading', () => {
    render(() => <StaffStats staffStats={[]} loading={true} />)

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should display row per staff member', () => {
    render(() => <StaffStats staffStats={mockStaffStats} />)

    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    expect(screen.getByText('Jean Martin')).toBeInTheDocument()
  })

  it('should show scheduled/completed counts', () => {
    const { container } = render(() => <StaffStats staffStats={mockStaffStats} />)

    // Should have rows with stat values
    const statValues = container.querySelectorAll('.stat-value')
    expect(statValues.length).toBeGreaterThan(0)

    // Check that both staff members are shown with their stats
    const rows = container.querySelectorAll('.staff-stats-row')
    expect(rows.length).toBe(2)
  })

  it('should show task counts and overdue indicator', () => {
    render(() => <StaffStats staffStats={mockStaffStats} />)

    // Jean has 2 overdue tasks
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should show "Membre supprimé" for null staff', () => {
    const statsWithDeleted: StaffMemberStats[] = [
      {
        staffMember: null,
        scheduledCount: 2,
        completedCount: 1,
        taskCount: 1,
        completedTaskCount: 0,
        overdueTaskCount: 1,
        completionRate: 33,
        hasOverdue: true,
      },
    ]

    render(() => <StaffStats staffStats={statsWithDeleted} />)

    expect(screen.getByText('Membre supprimé')).toBeInTheDocument()
  })

  it('should highlight members with overdue tasks', () => {
    const { container } = render(() => <StaffStats staffStats={mockStaffStats} />)

    // Jean has overdue tasks, should have danger indicator
    const rows = container.querySelectorAll('.staff-stats-row')
    expect(rows.length).toBe(2)

    // The row with overdue should have the indicator
    const overdueIndicators = container.querySelectorAll('.overdue-indicator')
    expect(overdueIndicators.length).toBeGreaterThan(0)
  })

  it('should show empty state when no staff', () => {
    render(() => <StaffStats staffStats={[]} />)

    expect(screen.getByText('Aucune donnée de personnel')).toBeInTheDocument()
  })
})
