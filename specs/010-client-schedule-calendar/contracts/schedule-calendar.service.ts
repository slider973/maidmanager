/**
 * Schedule Calendar Service Contract
 * Feature: 010-client-schedule-calendar
 *
 * Service pour récupérer les interventions planifiées d'un client
 * formatées pour l'affichage calendrier.
 */

// ============================================================================
// Types
// ============================================================================

export interface CalendarEvent {
  id: string
  scheduledDate: string // YYYY-MM-DD
  startTime: string | null // HH:MM:SS
  endTime: string | null // HH:MM:SS
  description: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  staffMember?: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

export interface CalendarMonth {
  year: number
  month: number // 0-11 (JavaScript convention)
  days: CalendarDay[]
}

export interface ServiceResult<T> {
  data: T
  error: string | null
}

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Récupère les interventions d'un client pour un mois donné.
 *
 * @param clientId - ID du client
 * @param year - Année (ex: 2026)
 * @param month - Mois (0-11, JavaScript convention)
 * @returns Liste des événements du mois
 *
 * @example
 * const result = await getClientScheduleForMonth('uuid', 2026, 1) // Février 2026
 * if (!result.error) {
 *   console.log(result.data) // CalendarEvent[]
 * }
 */
export async function getClientScheduleForMonth(
  clientId: string,
  year: number,
  month: number
): Promise<ServiceResult<CalendarEvent[]>> {
  // Implementation will query schedule_entries with:
  // - Filter by client_id
  // - Filter by date range (first to last day of month)
  // - Exclude cancelled (optional, based on UI needs)
  // - Include staff_member relation for manager view
  // - RLS handles staff filtering automatically
  throw new Error('Not implemented - contract only')
}

/**
 * Construit la grille du calendrier pour un mois donné.
 * Inclut les jours du mois précédent/suivant pour compléter les semaines.
 *
 * @param year - Année
 * @param month - Mois (0-11)
 * @param events - Événements à placer dans le calendrier
 * @returns Grille du calendrier avec événements
 *
 * @example
 * const events = await getClientScheduleForMonth(clientId, 2026, 1)
 * const calendar = buildCalendarMonth(2026, 1, events.data)
 */
export function buildCalendarMonth(
  year: number,
  month: number,
  events: CalendarEvent[]
): CalendarMonth {
  // Implementation will:
  // 1. Get first day of month and its weekday
  // 2. Get last day of month
  // 3. Add padding days from previous month
  // 4. Add all days of current month
  // 5. Add padding days from next month
  // 6. Map events to their respective days
  // 7. Mark today's date
  throw new Error('Not implemented - contract only')
}

/**
 * Récupère les détails d'une intervention spécifique.
 *
 * @param entryId - ID de l'entrée schedule_entries
 * @returns Détails complets de l'intervention
 */
export async function getScheduleEntryDetails(
  entryId: string
): Promise<ServiceResult<CalendarEvent | null>> {
  // Implementation will query single schedule_entry by ID
  // with staff_member relation
  throw new Error('Not implemented - contract only')
}
