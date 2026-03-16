/**
 * ClientSelect Component
 * Dropdown for selecting a client
 */

import { Show, For, createSignal, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import { clientStore } from '../../stores/clientStore'

interface ClientSelectProps {
  value: string
  onChange: (clientId: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  id?: string
  showAllOption?: boolean
  allOptionLabel?: string
}

export const ClientSelect: Component<ClientSelectProps> = (props) => {
  const { state, actions } = clientStore
  const [loaded, setLoaded] = createSignal(false)

  // Fetch clients on mount if not already loaded
  onMount(async () => {
    if (state.clients.length === 0 && !state.loading) {
      await actions.fetch()
    }
    setLoaded(true)
  })

  const activeClients = () => state.clients.filter((c) => c.is_active)

  return (
    <div class="form-group">
      <Show when={props.label}>
        <label class="form-label" for={props.id || 'client-select'}>
          {props.label}
        </label>
      </Show>
      <Show
        when={loaded() && !state.loading}
        fallback={
          <select class="form-input form-select" disabled>
            <option>Chargement...</option>
          </select>
        }
      >
        <select
          class="form-input form-select"
          id={props.id || 'client-select'}
          value={props.value}
          onChange={(e) => props.onChange(e.currentTarget.value)}
          required={props.required}
          disabled={props.disabled}
        >
          <Show when={props.showAllOption}>
            <option value="">{props.allOptionLabel || 'Tous les clients'}</option>
          </Show>
          <Show when={!props.showAllOption}>
            <option value="">{props.placeholder || 'Sélectionner un client'}</option>
          </Show>
          <For each={activeClients()}>
            {(client) => (
              <option value={client.id}>{client.name}</option>
            )}
          </For>
        </select>
      </Show>
    </div>
  )
}
