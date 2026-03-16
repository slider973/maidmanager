/**
 * CalendarView Component Props Contract
 * Feature: 010-client-schedule-calendar
 *
 * Définit l'interface des props pour les composants calendrier.
 */

import type { CalendarEvent, CalendarDay, CalendarMonth } from './schedule-calendar.service'

// ============================================================================
// CalendarView Props
// ============================================================================

export interface CalendarViewProps {
  /**
   * ID du client dont on affiche le calendrier
   */
  clientId: string

  /**
   * Nom du client (pour l'affichage dans le header)
   */
  clientName?: string

  /**
   * Si true, affiche le nom de l'employé sur chaque événement (vue manager)
   * Si false, n'affiche pas le nom (vue staff - implicite que c'est eux)
   */
  showStaffName?: boolean

  /**
   * Callback quand on clique sur un événement
   */
  onEventClick?: (event: CalendarEvent) => void

  /**
   * Callback quand on change de mois
   */
  onMonthChange?: (year: number, month: number) => void

  /**
   * Classe CSS additionnelle
   */
  class?: string
}

// ============================================================================
// CalendarDay Props
// ============================================================================

export interface CalendarDayProps {
  /**
   * Données du jour
   */
  day: CalendarDay

  /**
   * Si true, affiche le nom de l'employé sur les événements
   */
  showStaffName?: boolean

  /**
   * Callback quand on clique sur un événement
   */
  onEventClick?: (event: CalendarEvent) => void
}

// ============================================================================
// CalendarEvent Props
// ============================================================================

export interface CalendarEventProps {
  /**
   * Données de l'événement
   */
  event: CalendarEvent

  /**
   * Si true, affiche le nom de l'employé
   */
  showStaffName?: boolean

  /**
   * Callback au clic
   */
  onClick?: () => void
}

// ============================================================================
// EventDetailModal Props
// ============================================================================

export interface EventDetailModalProps {
  /**
   * Événement à afficher (null = modal fermée)
   */
  event: CalendarEvent | null

  /**
   * Si true, affiche le bouton "Modifier" (vue manager)
   */
  canEdit?: boolean

  /**
   * Callback pour fermer la modal
   */
  onClose: () => void

  /**
   * Callback pour modifier l'événement (optionnel, vue manager)
   */
  onEdit?: (eventId: string) => void
}

// ============================================================================
// CalendarHeader Props
// ============================================================================

export interface CalendarHeaderProps {
  /**
   * Année affichée
   */
  year: number

  /**
   * Mois affiché (0-11)
   */
  month: number

  /**
   * Callback pour aller au mois précédent
   */
  onPrevMonth: () => void

  /**
   * Callback pour aller au mois suivant
   */
  onNextMonth: () => void

  /**
   * Callback pour revenir à aujourd'hui
   */
  onToday?: () => void
}
