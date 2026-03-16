/**
 * ActivityChart Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { ActivityChart } from './ActivityChart'
import type { ActivitySeries } from '../../lib/types/statistics.types'

const mockSeries: ActivitySeries = {
  period: 'week',
  granularity: 'day',
  dataPoints: [
    { label: 'Lun', startDate: '2026-02-02', endDate: '2026-02-02', scheduledCount: 2, taskCount: 1, completedCount: 2 },
    { label: 'Mar', startDate: '2026-02-03', endDate: '2026-02-03', scheduledCount: 3, taskCount: 2, completedCount: 3 },
    { label: 'Mer', startDate: '2026-02-04', endDate: '2026-02-04', scheduledCount: 1, taskCount: 0, completedCount: 1 },
    { label: 'Jeu', startDate: '2026-02-05', endDate: '2026-02-05', scheduledCount: 4, taskCount: 3, completedCount: 5 },
    { label: 'Ven', startDate: '2026-02-06', endDate: '2026-02-06', scheduledCount: 2, taskCount: 1, completedCount: 2 },
  ],
}

const emptySeries: ActivitySeries = {
  period: 'week',
  granularity: 'day',
  dataPoints: [],
}

describe('ActivityChart', () => {
  it('should show loading spinner when loading', () => {
    render(() => <ActivityChart series={emptySeries} loading={true} />)

    expect(screen.getByText('Chargement du graphique...')).toBeInTheDocument()
  })

  it('should render SVG with bars', () => {
    const { container } = render(() => <ActivityChart series={mockSeries} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()

    const bars = container.querySelectorAll('rect')
    expect(bars.length).toBeGreaterThan(0)
  })

  it('should show labels for each data point', () => {
    render(() => <ActivityChart series={mockSeries} />)

    expect(screen.getByText('Lun')).toBeInTheDocument()
    expect(screen.getByText('Mar')).toBeInTheDocument()
    expect(screen.getByText('Mer')).toBeInTheDocument()
  })

  it('should show message when no data', () => {
    render(() => <ActivityChart series={emptySeries} />)

    expect(screen.getByText(/Pas suffisamment de données/)).toBeInTheDocument()
  })

  it('should have accessible role and label', () => {
    const { container } = render(() => <ActivityChart series={mockSeries} />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label')
  })
})
