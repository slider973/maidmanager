/**
 * StatCard Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('should display label and value', () => {
    render(() => <StatCard label="Personnel actif" value={5} />)

    expect(screen.getByText('Personnel actif')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should display string value', () => {
    render(() => <StatCard label="Taux" value="75%" />)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('should apply correct variant class', () => {
    const { container } = render(() => <StatCard label="Alerte" value={3} variant="danger" />)

    const card = container.querySelector('.stat-card')
    expect(card).toHaveClass('stat-card-danger')
  })

  it('should apply default variant when not specified', () => {
    const { container } = render(() => <StatCard label="Test" value={0} />)

    const card = container.querySelector('.stat-card')
    expect(card).not.toHaveClass('stat-card-danger')
    expect(card).not.toHaveClass('stat-card-success')
    expect(card).not.toHaveClass('stat-card-warning')
  })

  it('should display subtext when provided', () => {
    render(() => <StatCard label="Total" value={10} subtext="ce mois" />)

    expect(screen.getByText('ce mois')).toBeInTheDocument()
  })

  it('should not display subtext when not provided', () => {
    render(() => <StatCard label="Total" value={10} />)

    expect(screen.queryByText('ce mois')).not.toBeInTheDocument()
  })

  it('should have accessible structure', () => {
    render(() => <StatCard label="Personnel" value={5} />)

    // Value should be prominent
    const value = screen.getByText('5')
    expect(value).toBeInTheDocument()

    // Label should be visible
    const label = screen.getByText('Personnel')
    expect(label).toBeInTheDocument()
  })
})
