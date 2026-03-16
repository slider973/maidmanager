/**
 * ActivityChart Component
 * Displays activity evolution as an SVG bar chart
 */

import { Show, For, createMemo } from 'solid-js'
import type { ActivityChartProps } from '../../lib/types/statistics.types'

export function ActivityChart(props: ActivityChartProps) {
  // Chart dimensions
  const chartWidth = 600
  const chartHeight = 200
  const barPadding = 8
  const labelHeight = 30
  const topPadding = 20

  // Calculate bar dimensions based on data
  const chartData = createMemo(() => {
    const dataPoints = props.series.dataPoints
    if (dataPoints.length === 0) return { bars: [], maxValue: 0 }

    const barWidth = (chartWidth - barPadding * 2) / dataPoints.length - barPadding
    const maxValue = Math.max(
      ...dataPoints.map((dp) => dp.scheduledCount + dp.taskCount),
      1
    )
    const availableHeight = chartHeight - labelHeight - topPadding

    const bars = dataPoints.map((dp, i) => {
      const total = dp.scheduledCount + dp.taskCount
      const height = (total / maxValue) * availableHeight
      const x = barPadding + i * (barWidth + barPadding)
      const y = topPadding + availableHeight - height

      // Split bar for scheduled vs tasks
      const scheduledHeight = (dp.scheduledCount / (total || 1)) * height
      const taskHeight = (dp.taskCount / (total || 1)) * height

      return {
        x,
        y,
        width: barWidth,
        height,
        scheduledHeight,
        taskHeight,
        label: dp.label,
        total,
        scheduledCount: dp.scheduledCount,
        taskCount: dp.taskCount,
        completedCount: dp.completedCount,
      }
    })

    return { bars, maxValue }
  })

  const hasData = () => props.series.dataPoints.length > 0 && chartData().maxValue > 0

  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="loading-container">
          <div class="spinner" />
          <p>Chargement du graphique...</p>
        </div>
      }
    >
      <Show
        when={hasData()}
        fallback={
          <div class="empty-state-inline">
            <p>Pas suffisamment de données pour afficher le graphique.</p>
            <p class="empty-state-hint">Créez des interventions ou des missions pour voir l'évolution.</p>
          </div>
        }
      >
        <div class="activity-chart-container">
          <div class="chart-legend">
            <span class="legend-item legend-scheduled">
              <span class="legend-color" />
              Interventions
            </span>
            <span class="legend-item legend-tasks">
              <span class="legend-color" />
              Missions
            </span>
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            class="activity-chart"
            role="img"
            aria-label={`Graphique d'évolution de l'activité - ${props.series.period}`}
          >
            {/* Y-axis line */}
            <line
              x1={barPadding}
              y1={topPadding}
              x2={barPadding}
              y2={chartHeight - labelHeight}
              stroke="var(--color-border)"
              stroke-width="1"
            />

            {/* X-axis line */}
            <line
              x1={barPadding}
              y1={chartHeight - labelHeight}
              x2={chartWidth - barPadding}
              y2={chartHeight - labelHeight}
              stroke="var(--color-border)"
              stroke-width="1"
            />

            {/* Bars */}
            <For each={chartData().bars}>
              {(bar) => (
                <g class="chart-bar-group">
                  {/* Scheduled portion (bottom) */}
                  <rect
                    x={bar.x}
                    y={bar.y + bar.taskHeight}
                    width={bar.width}
                    height={bar.scheduledHeight}
                    fill="var(--color-primary)"
                    rx="2"
                    class="chart-bar chart-bar-scheduled"
                  >
                    <title>Interventions: {bar.scheduledCount}</title>
                  </rect>

                  {/* Tasks portion (top) */}
                  <Show when={bar.taskHeight > 0}>
                    <rect
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.taskHeight}
                      fill="var(--color-gold)"
                      rx="2"
                      class="chart-bar chart-bar-tasks"
                    >
                      <title>Missions: {bar.taskCount}</title>
                    </rect>
                  </Show>

                  {/* Value label above bar */}
                  <Show when={bar.total > 0}>
                    <text
                      x={bar.x + bar.width / 2}
                      y={bar.y - 5}
                      text-anchor="middle"
                      class="chart-value-label"
                      fill="var(--color-text-secondary)"
                      font-size="11"
                    >
                      {bar.total}
                    </text>
                  </Show>

                  {/* X-axis label */}
                  <text
                    x={bar.x + bar.width / 2}
                    y={chartHeight - labelHeight + 18}
                    text-anchor="middle"
                    class="chart-label"
                    fill="var(--color-text-secondary)"
                    font-size="12"
                  >
                    {bar.label}
                  </text>
                </g>
              )}
            </For>
          </svg>
        </div>
      </Show>
    </Show>
  )
}
