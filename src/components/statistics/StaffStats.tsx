/**
 * StaffStats Component
 * Displays statistics breakdown per staff member
 */

import { Show, For } from 'solid-js'
import type { StaffStatsProps, StaffMemberStats } from '../../lib/types/statistics.types'

export function StaffStats(props: StaffStatsProps) {
  const getMemberName = (stats: StaffMemberStats): string => {
    if (!stats.staffMember) return 'Membre supprimé'
    return `${stats.staffMember.firstName} ${stats.staffMember.lastName}`
  }

  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="loading-container">
          <div class="spinner" />
          <p>Chargement...</p>
        </div>
      }
    >
      <Show
        when={props.staffStats.length > 0}
        fallback={
          <div class="empty-state-inline">
            <p>Aucune donnée de personnel</p>
          </div>
        }
      >
        <div class="staff-stats-table">
          <div class="staff-stats-header">
            <div class="staff-stats-cell name-cell">Membre</div>
            <div class="staff-stats-cell">Interventions</div>
            <div class="staff-stats-cell">Missions</div>
            <div class="staff-stats-cell">Taux</div>
            <div class="staff-stats-cell">Alertes</div>
          </div>
          <For each={props.staffStats}>
            {(stats) => (
              <div
                class={`staff-stats-row ${stats.hasOverdue ? 'has-overdue' : ''} ${!stats.staffMember ? 'deleted-member' : ''}`}
              >
                <div class="staff-stats-cell name-cell">
                  <span class={!stats.staffMember ? 'deleted-text' : ''}>{getMemberName(stats)}</span>
                </div>
                <div class="staff-stats-cell">
                  <span class="stat-value">{stats.scheduledCount}</span>
                  <span class="stat-detail">({stats.completedCount} terminées)</span>
                </div>
                <div class="staff-stats-cell">
                  <span class="stat-value">{stats.taskCount}</span>
                  <span class="stat-detail">({stats.completedTaskCount} terminées)</span>
                </div>
                <div class="staff-stats-cell">
                  <span class={`completion-rate ${stats.completionRate >= 75 ? 'good' : stats.completionRate >= 50 ? 'medium' : 'low'}`}>
                    {stats.completionRate}%
                  </span>
                </div>
                <div class="staff-stats-cell">
                  <Show when={stats.hasOverdue}>
                    <span class="overdue-indicator">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{stats.overdueTaskCount}</span>
                    </span>
                  </Show>
                  <Show when={!stats.hasOverdue}>
                    <span class="no-alerts">-</span>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </Show>
  )
}
