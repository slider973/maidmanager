/**
 * Invoice Service
 * Provides CRUD operations for invoices and invoice lines
 */

import { api, ApiError } from '../lib/api'
import type {
  Invoice,
  InvoiceWithLines,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceFilters,
  InvoiceLine,
  InvoiceLineInsert,
  InvoiceStatus,
} from '../lib/types/billing.types'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

/**
 * Validation messages in French
 */
const validationMessages = {
  clientRequired: 'Veuillez sélectionner un client',
  noLines: 'La facture doit contenir au moins une ligne',
  invalidAmount: 'Le montant doit être supérieur à 0',
  descriptionRequired: 'La description est requise',
  invalidTransition: 'Transition de statut non autorisée',
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Generate the next invoice number for the current year
 * Format: FACT-YYYY-XXXX
 */
export async function generateInvoiceNumber(): Promise<ServiceResult<string>> {
  try {
    const result = await api.get<{ invoice_number: string }>('/invoices/next-number')
    return { data: result.invoice_number, error: null }
  } catch (err) {
    console.error('Failed to generate invoice number:', err)
    return { error: handleError(err) }
  }
}

/**
 * Get all invoices with optional filters
 */
export async function getInvoices(
  filters?: InvoiceFilters
): Promise<ServiceResult<Invoice[]>> {
  try {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.client_id) params.set('client_id', filters.client_id)
      if (filters.status) params.set('status', filters.status)
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)
    }

    const query = params.toString()
    const data = await api.get<Invoice[]>(`/invoices${query ? `?${query}` : ''}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get invoices:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single invoice by ID with its lines
 */
export async function getInvoice(
  id: string
): Promise<ServiceResult<InvoiceWithLines>> {
  try {
    const data = await api.get<InvoiceWithLines>(`/invoices/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get invoice:', err)
    return { error: handleError(err) }
  }
}

/**
 * Create a new invoice with lines
 */
export async function createInvoice(
  invoiceData: InvoiceInsert,
  lines: Omit<InvoiceLineInsert, 'invoice_id'>[]
): Promise<ServiceResult<Invoice>> {
  // Validate input
  if (!invoiceData.client_id) {
    return { error: validationMessages.clientRequired }
  }
  if (!lines || lines.length === 0) {
    return { error: validationMessages.noLines }
  }

  // Validate lines
  for (const line of lines) {
    if (!line.description || line.description.trim() === '') {
      return { error: validationMessages.descriptionRequired }
    }
    if (line.amount == null || line.amount <= 0) {
      return { error: validationMessages.invalidAmount }
    }
  }

  try {
    const invoice = await api.post<Invoice>('/invoices', {
      ...invoiceData,
      lines,
    })
    return { data: invoice, error: null }
  } catch (err) {
    console.error('Failed to create invoice:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update an invoice (only allowed for draft invoices)
 */
export async function updateInvoice(
  id: string,
  data: InvoiceUpdate
): Promise<ServiceResult<Invoice>> {
  try {
    const invoice = await api.put<Invoice>(`/invoices/${id}`, data)
    return { data: invoice, error: null }
  } catch (err) {
    console.error('Failed to update invoice:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete an invoice (only allowed for draft invoices)
 */
export async function deleteInvoice(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/invoices/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete invoice:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update invoice status with validation
 */
export async function updateInvoiceStatus(
  id: string,
  newStatus: InvoiceStatus,
  paymentDate?: string
): Promise<ServiceResult<Invoice>> {
  try {
    const invoice = await api.put<Invoice>(`/invoices/${id}/status`, {
      status: newStatus,
      payment_date: paymentDate,
    })
    return { data: invoice, error: null }
  } catch (err) {
    console.error('Failed to update invoice status:', err)
    return { error: handleError(err) }
  }
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(id: string): Promise<ServiceResult<Invoice>> {
  return updateInvoiceStatus(id, 'sent')
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  id: string,
  paymentDate: string
): Promise<ServiceResult<Invoice>> {
  return updateInvoiceStatus(id, 'paid', paymentDate)
}

/**
 * Cancel an invoice
 */
export async function cancelInvoice(id: string): Promise<ServiceResult<Invoice>> {
  return updateInvoiceStatus(id, 'cancelled')
}

/**
 * Add a line to an invoice (only allowed for draft invoices)
 */
export async function addInvoiceLine(
  invoiceId: string,
  line: Omit<InvoiceLineInsert, 'invoice_id'>
): Promise<ServiceResult<InvoiceLine>> {
  if (!line.description || line.description.trim() === '') {
    return { error: validationMessages.descriptionRequired }
  }
  if (line.amount == null || line.amount <= 0) {
    return { error: validationMessages.invalidAmount }
  }

  try {
    const newLine = await api.post<InvoiceLine>(`/invoices/${invoiceId}/lines`, line)
    return { data: newLine, error: null }
  } catch (err) {
    console.error('Failed to add invoice line:', err)
    return { error: handleError(err) }
  }
}

/**
 * Remove a line from an invoice (only allowed for draft invoices)
 */
export async function removeInvoiceLine(lineId: string): Promise<ServiceResult> {
  try {
    await api.delete(`/invoices/lines/${lineId}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to remove invoice line:', err)
    return { error: handleError(err) }
  }
}

/**
 * Recalculate invoice total from lines
 */
export async function recalculateInvoiceTotal(invoiceId: string): Promise<ServiceResult> {
  try {
    await api.post(`/invoices/${invoiceId}/recalculate`)
    return { error: null }
  } catch (err) {
    console.error('Failed to recalculate invoice total:', err)
    return { error: handleError(err) }
  }
}
