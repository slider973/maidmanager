/**
 * ClientList Component
 * Displays a list of clients with search functionality
 */

import { Show, For, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import { ClientCard } from './ClientCard'
import type { Client } from '../../lib/types/billing.types'

interface ClientListProps {
  clients: Client[]
  loading?: boolean
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onSelect?: (client: Client) => void
  emptyMessage?: string
}

export const ClientList: Component<ClientListProps> = (props) => {
  const [searchTerm, setSearchTerm] = createSignal('')

  const filteredClients = () => {
    const term = searchTerm().toLowerCase().trim()
    if (!term) return props.clients
    return props.clients.filter((client) =>
      client.name.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    )
  }

  return (
    <div class="client-list-container">
      <div class="client-list-header">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            class="form-input search-input"
            placeholder="Rechercher un client..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </div>
      </div>

      <Show when={props.loading}>
        <div class="loading-container">
          <div class="spinner" />
          <p>Chargement des clients...</p>
        </div>
      </Show>

      <Show when={!props.loading && filteredClients().length === 0}>
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p class="empty-message">
            {searchTerm()
              ? 'Aucun client trouvé pour cette recherche'
              : props.emptyMessage || 'Aucun client enregistré'}
          </p>
          <Show when={!searchTerm() && !props.emptyMessage}>
            <p class="empty-hint">Commencez par ajouter votre premier client</p>
          </Show>
        </div>
      </Show>

      <Show when={!props.loading && filteredClients().length > 0}>
        <div class="client-list">
          <For each={filteredClients()}>
            {(client) => (
              <ClientCard
                client={client}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                onClick={props.onSelect}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
