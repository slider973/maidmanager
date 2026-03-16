/**
 * StaffWorkView Page
 * Feature: 009-staff-portal (US5)
 * Manager view of staff work done
 */

import { createSignal, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import { DailyWorkReport } from '../components/staff/DailyWorkReport'
import { TimeEntryEditForm } from '../components/staff/TimeEntryEditForm'

const StaffWorkView: Component = () => {
  const [editingEntryId, setEditingEntryId] = createSignal<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = createSignal(0)

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId)
  }

  const handleCloseEdit = () => {
    setEditingEntryId(null)
  }

  const handleSaved = () => {
    // Trigger refresh of the report
    setRefreshTrigger((k) => k + 1)
  }

  return (
    <div class="page-container">
      {/* Header */}
      <header class="page-header">
        <div class="page-header-content">
          <A href="/" class="btn btn-ghost btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </A>
          <div class="page-header-title">
            <h1>Travail effectue</h1>
            <p class="page-header-subtitle">
              Vue d'ensemble du travail de votre personnel
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="page-content">
        <DailyWorkReport refreshTrigger={refreshTrigger()} onEditEntry={handleEditEntry} />
      </main>

      {/* Edit Modal */}
      <Show when={editingEntryId()}>
        <TimeEntryEditForm
          entryId={editingEntryId()!}
          onClose={handleCloseEdit}
          onSaved={handleSaved}
        />
      </Show>
    </div>
  )
}

export default StaffWorkView
