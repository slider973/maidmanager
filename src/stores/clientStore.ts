/**
 * Client Store
 * Centralized state management for clients using SolidJS createStore
 */

import { createSignal, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { Client, ClientInsert, ClientUpdate } from '../lib/types/billing.types'
import * as clientService from '../services/client.service'

interface ClientState {
  clients: Client[]
  loading: boolean
  error: string | null
  initialized: boolean
}

function createClientStore() {
  const [state, setState] = createStore<ClientState>({
    clients: [],
    loading: false,
    error: null,
    initialized: false,
  })

  const [fetchPromise, setFetchPromise] = createSignal<Promise<void> | null>(null)

  const actions = {
    /**
     * Fetch all clients
     */
    async fetch(options?: { search?: string }) {
      // Prevent duplicate fetches (unless search is different)
      const existingPromise = fetchPromise()
      if (existingPromise && !options?.search) {
        return existingPromise
      }

      setState({ loading: true, error: null })

      const promise = (async () => {
        try {
          const result = await clientService.getClients(options)

          if (result.error) {
            setState({ error: result.error, loading: false, initialized: true })
          } else {
            setState({ clients: result.data || [], loading: false, error: null, initialized: true })
          }
        } catch (err) {
          setState({
            error: err instanceof Error ? err.message : 'Erreur inconnue',
            loading: false,
            initialized: true,
          })
        } finally {
          setFetchPromise(null)
        }
      })()

      setFetchPromise(promise)
      return promise
    },

    /**
     * Add a new client
     */
    async add(data: ClientInsert) {
      const result = await clientService.createClient(data)
      if (!result.error && result.data) {
        setState('clients', (clients) => [result.data!, ...clients])
      }
      return result
    },

    /**
     * Update a client
     */
    async update(id: string, data: ClientUpdate) {
      const result = await clientService.updateClient(id, data)
      if (!result.error && result.data) {
        setState('clients', (clients) =>
          clients.map((c) => (c.id === id ? result.data! : c))
        )
      }
      return result
    },

    /**
     * Delete a client
     */
    async delete(id: string) {
      const result = await clientService.deleteClient(id)
      if (!result.error) {
        setState('clients', (clients) => clients.filter((c) => c.id !== id))
      }
      return result
    },

    /**
     * Get a single client by ID from local state
     */
    getById(id: string): Client | undefined {
      return state.clients.find((c) => c.id === id)
    },

    /**
     * Reset store state
     */
    reset() {
      setState({
        clients: [],
        loading: false,
        error: null,
        initialized: false,
      })
      setFetchPromise(null)
    },
  }

  return { state, actions }
}

// Create singleton store
export const clientStore = createRoot(createClientStore)
