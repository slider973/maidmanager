/**
 * Statistics Page
 * Dashboard for viewing activity reports and statistics
 * Feature: 006-view-statistics
 */

import { createSignal, createEffect, on, createMemo } from 'solid-js'
import { A } from '@solidjs/router'
import { useAuth } from '../lib/auth'
import { staffStore } from '../stores/staff.store'
import { scheduleStore } from '../stores/schedule.store'
import { taskStore } from '../stores/task.store'
import { StatsOverview } from '../components/statistics/StatsOverview'
import { PeriodFilter } from '../components/statistics/PeriodFilter'
import { StaffStats } from '../components/statistics/StaffStats'
import { ActivityChart } from '../components/statistics/ActivityChart'
import {
  getDateRange,
  calculateGlobalStats,
  calculateStaffStats,
  calculateActivitySeries,
  exportToCSV,
  prepareExportData,
} from '../services/statistics.service'
import type { StatsPeriod, GlobalStats, StaffMemberStats, ActivitySeries } from '../lib/types/statistics.types'

export default function Statistics() {
  const { session, loading: authLoading } = useAuth()

  // Selected period filter
  const [period, setPeriod] = createSignal<StatsPeriod>('month')

  // Fetch data when auth is ready
  createEffect(
    on(
      () => ({ loading: authLoading(), session: session() }),
      ({ loading: isLoading, session: sess }) => {
        if (!isLoading && sess) {
          staffStore.actions.fetch()
          scheduleStore.actions.fetch()
          taskStore.actions.fetch()
        }
      }
    )
  )

  // Check if any data is loading
  const isLoading = () =>
    staffStore.state.loading || scheduleStore.state.loading || taskStore.state.loading

  // Calculate date range based on selected period
  const dateRange = createMemo(() => getDateRange(period()))

  // Calculate global statistics
  const globalStats = createMemo<GlobalStats>(() => {
    return calculateGlobalStats(
      scheduleStore.state.entries,
      taskStore.state.tasks,
      staffStore.state.members,
      dateRange()
    )
  })

  // Calculate per-staff statistics
  const staffStats = createMemo<StaffMemberStats[]>(() => {
    return calculateStaffStats(
      scheduleStore.state.entries,
      taskStore.state.tasks,
      staffStore.state.members,
      dateRange()
    )
  })

  // Calculate activity series for chart
  const activitySeries = createMemo<ActivitySeries>(() => {
    return calculateActivitySeries(
      scheduleStore.state.entries,
      taskStore.state.tasks,
      period()
    )
  })

  // Handle CSV export
  const handleExport = () => {
    const data = prepareExportData(
      scheduleStore.state.entries,
      taskStore.state.tasks,
      staffStore.state.members,
      dateRange()
    )
    const filename = `statistiques-${period()}-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(data, filename)
  }

  return (
    <div class="statistics-page">
      {/* Header */}
      <header class="page-header">
        <div class="header-left">
          <A href="/" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Retour
          </A>
          <h1 class="page-title">Statistiques</h1>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary" onClick={handleExport}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exporter CSV
          </button>
        </div>
      </header>

      {/* Period Filter */}
      <section class="filter-section">
        <PeriodFilter value={period()} onChange={setPeriod} />
      </section>

      {/* Stats Overview */}
      <section class="stats-section">
        <StatsOverview stats={globalStats()} loading={isLoading()} />
      </section>

      {/* Activity Chart */}
      <section class="chart-section">
        <div class="section-header">
          <h2 class="section-title">Évolution de l'activité</h2>
        </div>
        <div class="section-content">
          <ActivityChart series={activitySeries()} loading={isLoading()} />
        </div>
      </section>

      {/* Staff Stats */}
      <section class="staff-section">
        <div class="section-header">
          <h2 class="section-title">Statistiques par membre</h2>
        </div>
        <div class="section-content">
          <StaffStats staffStats={staffStats()} loading={isLoading()} />
        </div>
      </section>
    </div>
  )
}
