/**
 * Invoice Service
 * Provides CRUD operations for invoices and invoice lines
 */

import { supabase } from '../lib/supabase'
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

/**
 * Generate the next invoice number for the current year
 * Format: FACT-YYYY-XXXX
 */
export async function generateInvoiceNumber(): Promise<ServiceResult<string>> {
  try {
    const year = new Date().getFullYear()
    const prefix = `FACT-${year}-`

    // Get the highest invoice number for this year
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)

    if (error) {
      throw error
    }

    let nextSequence = 1
    if (data && data.length > 0) {
      const lastNumber = data[0].invoice_number
      const lastSequence = parseInt(lastNumber.replace(prefix, ''), 10)
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1
      }
    }

    const invoiceNumber = `${prefix}${String(nextSequence).padStart(4, '0')}`
    return { data: invoiceNumber, error: null }
  } catch (err) {
    console.error('Failed to generate invoice number:', err)
    return { error: 'Échec de la génération du numéro de facture' }
  }
}

/**
 * Get all invoices with optional filters
 */
export async function getInvoices(
  filters?: InvoiceFilters
): Promise<ServiceResult<Invoice[]>> {
  try {
    let query = supabase
      .from('invoices')
      .select('*')

    if (filters) {
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.date_from) {
        query = query.gte('invoice_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('invoice_date', filters.date_to)
      }
    }

    const { data, error } = await query
      .order('invoice_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: (data as Invoice[]) || [], error: null }
  } catch (err) {
    console.error('Failed to get invoices:', err)
    return { data: [], error: 'Échec du chargement des factures' }
  }
}

/**
 * Get a single invoice by ID with its lines
 */
export async function getInvoice(
  id: string
): Promise<ServiceResult<InvoiceWithLines>> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        lines:invoice_lines (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return { data: data as InvoiceWithLines, error: null }
  } catch (err) {
    console.error('Failed to get invoice:', err)
    return { error: 'Facture non trouvée' }
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
    // Get client info for snapshot
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name, address, email')
      .eq('id', invoiceData.client_id)
      .single()

    if (clientError || !client) {
      return { error: 'Client non trouvé' }
    }

    // Generate invoice number
    const numberResult = await generateInvoiceNumber()
    if (numberResult.error || !numberResult.data) {
      return { error: numberResult.error || 'Erreur de numérotation' }
    }

    // Calculate total
    const totalAmount = lines.reduce((sum, line) => sum + line.amount, 0)

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        client_id: invoiceData.client_id,
        invoice_number: numberResult.data,
        client_name: client.name,
        client_address: client.address,
        client_email: client.email,
        invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        notes: invoiceData.notes,
        status: 'draft',
      })
      .select()
      .single()

    if (invoiceError || !invoice) {
      throw invoiceError
    }

    // Create invoice lines
    const linesWithInvoiceId = lines.map((line) => ({
      ...line,
      invoice_id: invoice.id,
    }))

    const { error: linesError } = await supabase
      .from('invoice_lines')
      .insert(linesWithInvoiceId)

    if (linesError) {
      // Rollback: delete the invoice if lines failed
      await supabase.from('invoices').delete().eq('id', invoice.id)
      throw linesError
    }

    return { data: invoice as Invoice, error: null }
  } catch (err) {
    console.error('Failed to create invoice:', err)
    return { error: 'Échec de la création de la facture' }
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
    // Check current status
    const { data: current, error: checkError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .single()

    if (checkError || !current) {
      return { error: 'Facture non trouvée' }
    }

    // Only draft invoices can be fully edited
    if (current.status !== 'draft' && data.invoice_date) {
      return { error: 'Seules les factures en brouillon peuvent être modifiées' }
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data: invoice as Invoice, error: null }
  } catch (err) {
    console.error('Failed to update invoice:', err)
    return { error: 'Échec de la modification de la facture' }
  }
}

/**
 * Delete an invoice (only allowed for draft invoices)
 */
export async function deleteInvoice(id: string): Promise<ServiceResult> {
  try {
    // Check current status
    const { data: current, error: checkError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .single()

    if (checkError || !current) {
      return { error: 'Facture non trouvée' }
    }

    if (current.status !== 'draft') {
      return { error: 'Seules les factures en brouillon peuvent être supprimées' }
    }

    // Delete lines first (cascade should handle this, but be explicit)
    await supabase.from('invoice_lines').delete().eq('invoice_id', id)

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (err) {
    console.error('Failed to delete invoice:', err)
    return { error: 'Échec de la suppression de la facture' }
  }
}

/**
 * Check if a status transition is valid
 */
function isValidTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['paid', 'cancelled'],
    paid: [],
    cancelled: [],
  }
  return transitions[from].includes(to)
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
    // Get current status
    const { data: current, error: checkError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .single()

    if (checkError || !current) {
      return { error: 'Facture non trouvée' }
    }

    // Validate transition
    if (!isValidTransition(current.status as InvoiceStatus, newStatus)) {
      return { error: validationMessages.invalidTransition }
    }

    const updateData: InvoiceUpdate = { status: newStatus }
    if (newStatus === 'paid' && paymentDate) {
      updateData.payment_date = paymentDate
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data: invoice as Invoice, error: null }
  } catch (err) {
    console.error('Failed to update invoice status:', err)
    return { error: 'Échec de la modification du statut' }
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
    // Check invoice status
    const { data: invoice, error: checkError } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('id', invoiceId)
      .single()

    if (checkError || !invoice) {
      return { error: 'Facture non trouvée' }
    }

    if (invoice.status !== 'draft') {
      return { error: 'Seules les factures en brouillon peuvent être modifiées' }
    }

    // Add line
    const { data: newLine, error: lineError } = await supabase
      .from('invoice_lines')
      .insert({ ...line, invoice_id: invoiceId })
      .select()
      .single()

    if (lineError) {
      throw lineError
    }

    // Update total
    await supabase
      .from('invoices')
      .update({ total_amount: invoice.total_amount + line.amount })
      .eq('id', invoiceId)

    return { data: newLine as InvoiceLine, error: null }
  } catch (err) {
    console.error('Failed to add invoice line:', err)
    return { error: "Échec de l'ajout de la ligne" }
  }
}

/**
 * Remove a line from an invoice (only allowed for draft invoices)
 */
export async function removeInvoiceLine(lineId: string): Promise<ServiceResult> {
  try {
    // Get line and invoice info
    const { data: line, error: lineError } = await supabase
      .from('invoice_lines')
      .select('invoice_id, amount')
      .eq('id', lineId)
      .single()

    if (lineError || !line) {
      return { error: 'Ligne non trouvée' }
    }

    // Check invoice status
    const { data: invoice, error: checkError } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('id', line.invoice_id)
      .single()

    if (checkError || !invoice) {
      return { error: 'Facture non trouvée' }
    }

    if (invoice.status !== 'draft') {
      return { error: 'Seules les factures en brouillon peuvent être modifiées' }
    }

    // Delete line
    const { error } = await supabase
      .from('invoice_lines')
      .delete()
      .eq('id', lineId)

    if (error) {
      throw error
    }

    // Update total
    await supabase
      .from('invoices')
      .update({ total_amount: Math.max(0, invoice.total_amount - line.amount) })
      .eq('id', line.invoice_id)

    return { error: null }
  } catch (err) {
    console.error('Failed to remove invoice line:', err)
    return { error: 'Échec de la suppression de la ligne' }
  }
}

/**
 * Recalculate invoice total from lines
 */
export async function recalculateInvoiceTotal(invoiceId: string): Promise<ServiceResult> {
  try {
    const { data: lines, error: linesError } = await supabase
      .from('invoice_lines')
      .select('amount')
      .eq('invoice_id', invoiceId)

    if (linesError) {
      throw linesError
    }

    const total = (lines || []).reduce((sum, line) => sum + (line.amount || 0), 0)

    const { error } = await supabase
      .from('invoices')
      .update({ total_amount: total })
      .eq('id', invoiceId)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (err) {
    console.error('Failed to recalculate invoice total:', err)
    return { error: 'Échec du recalcul du total' }
  }
}
