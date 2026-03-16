/**
 * PeriodFilter Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { PeriodFilter } from './PeriodFilter'

describe('PeriodFilter', () => {
  it('should render all period options', () => {
    const onChange = vi.fn()
    render(() => <PeriodFilter value="month" onChange={onChange} />)

    expect(screen.getByText('Cette semaine')).toBeInTheDocument()
    expect(screen.getByText('Ce mois')).toBeInTheDocument()
    expect(screen.getByText('3 derniers mois')).toBeInTheDocument()
    expect(screen.getByText('Cette année')).toBeInTheDocument()
    expect(screen.getByText('Tout')).toBeInTheDocument()
  })

  it('should highlight current selection', () => {
    const onChange = vi.fn()
    render(() => <PeriodFilter value="month" onChange={onChange} />)

    const monthButton = screen.getByText('Ce mois')
    expect(monthButton).toHaveAttribute('aria-pressed', 'true')

    const weekButton = screen.getByText('Cette semaine')
    expect(weekButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should call onChange when option clicked', () => {
    const onChange = vi.fn()
    render(() => <PeriodFilter value="month" onChange={onChange} />)

    const weekButton = screen.getByText('Cette semaine')
    fireEvent.click(weekButton)

    expect(onChange).toHaveBeenCalledWith('week')
  })

  it('should be keyboard accessible', () => {
    const onChange = vi.fn()
    render(() => <PeriodFilter value="month" onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(5)

    // All buttons should be focusable
    buttons.forEach((button) => {
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
