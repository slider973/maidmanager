/**
 * ClientCard Component
 * Displays a single client in a card format
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from '@solidjs/router'
import type { Client } from '../../lib/types/billing.types'

interface ClientCardProps {
  client: Client
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onClick?: (client: Client) => void
}

export const ClientCard: Component<ClientCardProps> = (props) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(props.client)
    }
  }

  const handleEdit = (e: Event) => {
    e.stopPropagation()
    if (props.onEdit) {
      props.onEdit(props.client)
    }
  }

  const handleDelete = (e: Event) => {
    e.stopPropagation()
    if (props.onDelete) {
      props.onDelete(props.client)
    }
  }

  return (
    <div
      class="client-card"
      classList={{ clickable: !!props.onClick }}
      onClick={handleClick}
      role={props.onClick ? 'button' : undefined}
      tabIndex={props.onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div class="client-card-header">
        <h3 class="client-name">{props.client.name}</h3>
        <div class="client-actions">
          <A
            href={`/clients/${props.client.id}/schedule`}
            class="btn-icon"
            title="Calendrier"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </A>
          <A
            href={`/clients/${props.client.id}/rooms`}
            class="btn-icon"
            title="Pieces et instructions"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </A>
          <Show when={props.onEdit}>
            <button
              type="button"
              class="btn-icon"
              onClick={handleEdit}
              aria-label="Modifier le client"
              title="Modifier"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </Show>
          <Show when={props.onDelete}>
            <button
              type="button"
              class="btn-icon btn-icon-danger"
              onClick={handleDelete}
              aria-label="Supprimer le client"
              title="Supprimer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </Show>
        </div>
      </div>

      <div class="client-card-body">
        <Show when={props.client.address}>
          <div class="client-info">
            <svg class="client-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="client-info-text">{props.client.address}</span>
          </div>
        </Show>

        <Show when={props.client.email}>
          <div class="client-info">
            <svg class="client-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${props.client.email}`} class="client-info-link" onClick={(e) => e.stopPropagation()}>
              {props.client.email}
            </a>
          </div>
        </Show>

        <Show when={props.client.phone}>
          <div class="client-info">
            <svg class="client-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <a href={`tel:${props.client.phone}`} class="client-info-link" onClick={(e) => e.stopPropagation()}>
              {props.client.phone}
            </a>
          </div>
        </Show>

        <Show when={props.client.notes}>
          <div class="client-notes">
            <span class="client-notes-label">Notes:</span>
            <span class="client-notes-text">{props.client.notes}</span>
          </div>
        </Show>
      </div>
    </div>
  )
}
