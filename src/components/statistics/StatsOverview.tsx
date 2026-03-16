/**
 * StatsOverview Component
 * Displays global statistics in a grid of StatCard components
 */

import { Show } from 'solid-js'
import { StatCard } from './StatCard'
import type { StatsOverviewProps } from '../../lib/types/statistics.types'

export function StatsOverview(props: StatsOverviewProps) {
  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="loading-container">
          <div class="spinner" />
          <p>Chargement des statistiques...</p>
        </div>
      }
    >
      <div class="stats-overview">
        {/* Interventions Section */}
        <div class="stats-group">
          <h3 class="stats-section-title">Interventions</h3>
          <div class="stats-grid">
            <StatCard label="Total" value={props.stats.totalScheduled} icon="calendar" />
            <StatCard
              label="Terminées"
              value={props.stats.completedScheduled}
              icon="check"
              variant="success"
            />
            <StatCard
              label="Annulées"
              value={props.stats.cancelledScheduled}
              variant={props.stats.cancelledScheduled > 0 ? 'warning' : 'default'}
            />
            <StatCard
              label="Taux de complétion"
              value={`${props.stats.scheduledCompletionRate}%`}
              variant={props.stats.scheduledCompletionRate >= 75 ? 'success' : 'default'}
            />
          </div>
        </div>

        {/* Missions Section */}
        <div class="stats-group">
          <h3 class="stats-section-title">Missions</h3>
          <div class="stats-grid">
            <StatCard label="Total" value={props.stats.totalTasks} icon="tasks" />
            <StatCard label="En attente" value={props.stats.pendingTasks} />
            <StatCard
              label="En cours"
              value={props.stats.inProgressTasks}
              variant="warning"
            />
            <StatCard
              label="Terminées"
              value={props.stats.completedTasks}
              icon="check"
              variant="success"
            />
            <StatCard
              label="En retard"
              value={props.stats.overdueTasks}
              icon="alert"
              variant={props.stats.overdueTasks > 0 ? 'danger' : 'default'}
            />
            <StatCard
              label="Taux de complétion"
              value={`${props.stats.taskCompletionRate}%`}
              variant={props.stats.taskCompletionRate >= 75 ? 'success' : 'default'}
            />
          </div>
        </div>

        {/* Personnel Section */}
        <div class="stats-group">
          <h3 class="stats-section-title">Personnel</h3>
          <div class="stats-grid">
            <StatCard
              label="Actif"
              value={props.stats.activeStaffCount}
              icon="users"
              variant="success"
            />
            <StatCard
              label="Total"
              value={props.stats.totalStaffCount}
              subtext="membres enregistrés"
            />
          </div>
        </div>
      </div>
    </Show>
  )
}
