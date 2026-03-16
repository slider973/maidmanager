/**
 * ScheduleCard Component Tests
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { ScheduleCard } from './ScheduleCard'
import type { ScheduleEntryWithStaff } from '../../lib/types/database'

const mockEntry: ScheduleEntryWithStaff = {
  id: 'entry-1',
  user_id: 'test-user-id',
  staff_member_id: 'staff-1',
  client_id: null,
  scheduled_date: '2026-02-10',
  start_time: '09:00:00',
  end_time: '12:00:00',
  description: 'Ménage salon et cuisine',
  status: 'scheduled',
  notes: 'Utiliser les produits bio',
  amount: null,
  created_at: '2026-02-06T00:00:00Z',
  updated_at: '2026-02-06T00:00:00Z',
  staff_member: {
    id: 'staff-1',
    first_name: 'Marie',
    last_name: 'Dupont',
    position: 'housekeeper',
  },
  client: null,
}

describe('ScheduleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the entry description', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText('Ménage salon et cuisine')).toBeInTheDocument()
  })

  it('should render the scheduled date', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    // Date format in French: 10 février 2026
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/février/i)).toBeInTheDocument()
  })

  it('should render start time', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
  })

  it('should render time range when end_time is provided', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
    expect(screen.getByText(/12:00/)).toBeInTheDocument()
  })

  it('should render staff member name', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
  })

  it('should render staff member position in French', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText('Femme de ménage')).toBeInTheDocument()
  })

  it('should render status badge as "Planifié" for scheduled entries', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText('Planifié')).toBeInTheDocument()
  })

  it('should render status badge as "Terminé" for completed entries', () => {
    const completedEntry = { ...mockEntry, status: 'completed' as const }
    render(() => <ScheduleCard entry={completedEntry} />)
    expect(screen.getByText('Terminé')).toBeInTheDocument()
  })

  it('should render status badge as "Annulé" for cancelled entries', () => {
    const cancelledEntry = { ...mockEntry, status: 'cancelled' as const }
    render(() => <ScheduleCard entry={cancelledEntry} />)
    expect(screen.getByText('Annulé')).toBeInTheDocument()
  })

  it('should render notes when provided', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText('Utiliser les produits bio')).toBeInTheDocument()
  })

  it('should not render notes section when notes are null', () => {
    const entryWithoutNotes = { ...mockEntry, notes: null }
    render(() => <ScheduleCard entry={entryWithoutNotes} />)
    expect(screen.queryByText('Utiliser les produits bio')).not.toBeInTheDocument()
  })

  it('should show message when staff member is null', () => {
    const entryWithoutStaff: ScheduleEntryWithStaff = {
      ...mockEntry,
      staff_member_id: null,
      staff_member: null,
    }
    render(() => <ScheduleCard entry={entryWithoutStaff} />)
    expect(screen.getByText(/membre supprimé/i)).toBeInTheDocument()
  })

  it('should render staff avatar with initials', () => {
    render(() => <ScheduleCard entry={mockEntry} />)
    expect(screen.getByText('MD')).toBeInTheDocument()
  })

  it('should have completed card style for completed entries', () => {
    const completedEntry = { ...mockEntry, status: 'completed' as const }
    const { container } = render(() => <ScheduleCard entry={completedEntry} />)
    expect(container.querySelector('.schedule-card-completed')).toBeInTheDocument()
  })

  it('should have cancelled card style for cancelled entries', () => {
    const cancelledEntry = { ...mockEntry, status: 'cancelled' as const }
    const { container } = render(() => <ScheduleCard entry={cancelledEntry} />)
    expect(container.querySelector('.schedule-card-cancelled')).toBeInTheDocument()
  })
})
