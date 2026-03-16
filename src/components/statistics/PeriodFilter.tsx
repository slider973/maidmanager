/**
 * PeriodFilter Component
 * Button group for selecting time period
 */

import { For } from 'solid-js'
import { STATS_PERIODS, PERIOD_LABELS } from '../../lib/types/statistics.types'
import type { PeriodFilterProps, StatsPeriod } from '../../lib/types/statistics.types'

export function PeriodFilter(props: PeriodFilterProps) {
  const handleClick = (period: StatsPeriod) => {
    props.onChange(period)
  }

  return (
    <div class="period-filter" role="group" aria-label="Filtrer par période">
      <For each={STATS_PERIODS}>
        {(period) => (
          <button
            type="button"
            class={`period-filter-btn ${props.value === period ? 'active' : ''}`}
            aria-pressed={props.value === period}
            onClick={() => handleClick(period)}
          >
            {PERIOD_LABELS[period]}
          </button>
        )}
      </For>
    </div>
  )
}
