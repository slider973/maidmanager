/**
 * StatCard Component
 * Displays a single metric with label, value, and optional icon/variant
 */

import type { StatCardProps } from '../../lib/types/statistics.types'

export function StatCard(props: StatCardProps) {
  const variantClass = () => {
    if (!props.variant || props.variant === 'default') return ''
    return `stat-card-${props.variant}`
  }

  const iconPath = () => {
    switch (props.icon) {
      case 'users':
        return (
          <>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </>
        )
      case 'calendar':
        return (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </>
        )
      case 'tasks':
        return (
          <>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="15" y2="16" />
          </>
        )
      case 'check':
        return (
          <>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </>
        )
      case 'alert':
        return (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div class={`stat-card ${variantClass()}`}>
      {props.icon && (
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            {iconPath()}
          </svg>
        </div>
      )}
      <div class="stat-value">{props.value}</div>
      <div class="stat-label">{props.label}</div>
      {props.subtext && <div class="stat-subtext">{props.subtext}</div>}
    </div>
  )
}
