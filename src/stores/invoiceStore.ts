/**
 * Invoice Store
 * Reactive state management for invoices
 */

import { createStore } from 'solid-js/store'
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsSent,
  markInvoiceAsPaid,
  cancelInvoice,
} from '../services/invoice.service'
import type {
  Invoice,
  InvoiceWithLines,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceFilters,
  InvoiceLineInsert,
} from '../lib/types/billing.types'

interface InvoiceState {
  invoices: Invoice[]
  currentInvoice: InvoiceWithLines | null
  loading: boolean
  error: string | null
  filters: InvoiceFilters
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  filters: {},
}

const [state, setState] = createStore<InvoiceState>(initialState)

const actions = {
  /**
   * Fetch all invoices with current filters
   */
  async fetch(filters?: InvoiceFilters) {
    setState({ loading: true, error: null })
    if (filters) {
      setState({ filters })
    }
    const result = await getInvoices(filters || state.filters)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    setState({ invoices: result.data || [], loading: false })
    return { error: null }
  },

  /**
   * Fetch a single invoice by ID
   */
  async fetchById(id: string) {
    setState({ loading: true, error: null })
    const result = await getInvoice(id)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    setState({ currentInvoice: result.data || null, loading: false })
    return { error: null, data: result.data }
  },

  /**
   * Create a new invoice
   */
  async create(data: InvoiceInsert, lines: Omit<InvoiceLineInsert, 'invoice_id'>[]) {
    setState({ loading: true, error: null })
    const result = await createInvoice(data, lines)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    // Refresh the list
    await actions.fetch()
    return { error: null, data: result.data }
  },

  /**
   * Update an invoice
   */
  async update(id: string, data: InvoiceUpdate) {
    setState({ loading: true, error: null })
    const result = await updateInvoice(id, data)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    // Update local state
    setState('invoices', (invoices) =>
      invoices.map((inv) => (inv.id === id ? { ...inv, ...result.data } : inv))
    )
    if (state.currentInvoice?.id === id) {
      setState('currentInvoice', (current) =>
        current ? { ...current, ...result.data } : null
      )
    }
    setState({ loading: false })
    return { error: null, data: result.data }
  },

  /**
   * Delete an invoice
   */
  async delete(id: string) {
    setState({ loading: true, error: null })
    const result = await deleteInvoice(id)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    // Remove from local state
    setState('invoices', (invoices) => invoices.filter((inv) => inv.id !== id))
    if (state.currentInvoice?.id === id) {
      setState({ currentInvoice: null })
    }
    setState({ loading: false })
    return { error: null }
  },

  /**
   * Mark invoice as sent
   */
  async markAsSent(id: string) {
    setState({ loading: true, error: null })
    const result = await markInvoiceAsSent(id)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    // Update local state
    setState('invoices', (invoices) =>
      invoices.map((inv) => (inv.id === id ? { ...inv, status: 'sent' as const } : inv))
    )
    if (state.currentInvoice?.id === id) {
      setState('currentInvoice', 'status', 'sent')
    }
    setState({ loading: false })
    return { error: null, data: result.data }
  },

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string, paymentDate: string) {
    setState({ loading: true, error: null })
    const result = await markInvoiceAsPaid(id, paymentDate)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    // Update local state
    setState('invoices', (invoices) =>
      invoices.map((inv) =>
        inv.id === id ? { ...inv, status: 'paid' as const, payment_date: paymentDate } : inv
      )
    )
    if (state.currentInvoice?.id === id) {
      setState('currentInvoice', (current) =>
        current ? { ...current, status: 'paid', payment_date: paymentDate } : null
      )
    }
    setState({ loading: false })
    return { error: null, data: result.data }
  },

  /**
   * Cancel an invoice
   */
  async cancel(id: string) {
    setState({ loading: true, error: null })
    const result = await cancelInvoice(id)
    if (result.error) {
      setState({ loading: false, error: result.error })
      return { error: result.error }
    }
    // Update local state
    setState('invoices', (invoices) =>
      invoices.map((inv) =>
        inv.id === id ? { ...inv, status: 'cancelled' as const } : inv
      )
    )
    if (state.currentInvoice?.id === id) {
      setState('currentInvoice', 'status', 'cancelled')
    }
    setState({ loading: false })
    return { error: null, data: result.data }
  },

  /**
   * Set filters and refetch
   */
  async setFilters(filters: InvoiceFilters) {
    return actions.fetch(filters)
  },

  /**
   * Clear current invoice
   */
  clearCurrent() {
    setState({ currentInvoice: null })
  },

  /**
   * Get invoice by ID from local state
   */
  getById(id: string): Invoice | undefined {
    return state.invoices.find((inv) => inv.id === id)
  },

  /**
   * Reset store to initial state
   */
  reset() {
    setState(initialState)
  },
}

export const invoiceStore = { state, actions }
