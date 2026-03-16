/**
 * Billing Feature Type Definitions
 * Feature: 007-billing
 * Generated: 2026-02-07
 *
 * Copy these types to src/lib/types/billing.types.ts during implementation
 */

// ============================================================================
// Invoice Status
// ============================================================================

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée',
}

// Valid status transitions
export const INVOICE_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
}

// ============================================================================
// Client Entity
// ============================================================================

export interface Client {
  id: string
  user_id: string
  name: string
  address: string | null
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClientInsert {
  name: string
  address?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface ClientUpdate {
  name?: string
  address?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface ClientFilters {
  search?: string // Search by name
}

// ============================================================================
// Invoice Entity
// ============================================================================

export interface Invoice {
  id: string
  user_id: string
  client_id: string | null
  invoice_number: string
  client_name: string
  client_address: string | null
  client_email: string | null
  status: InvoiceStatus
  total_amount: number
  invoice_date: string
  payment_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceWithLines extends Invoice {
  lines: InvoiceLine[]
}

export interface InvoiceWithClient extends Invoice {
  client: Client | null
}

export interface InvoiceInsert {
  client_id: string
  invoice_date?: string
  notes?: string | null
  // client_name, client_address, client_email are auto-populated from client
  // invoice_number is auto-generated
}

export interface InvoiceUpdate {
  status?: InvoiceStatus
  payment_date?: string | null
  notes?: string | null
  // invoice_date can only be updated while draft
  invoice_date?: string
}

export interface InvoiceFilters {
  client_id?: string
  status?: InvoiceStatus
  date_from?: string
  date_to?: string
}

// ============================================================================
// Invoice Line Entity
// ============================================================================

export interface InvoiceLine {
  id: string
  invoice_id: string
  schedule_entry_id: string | null
  description: string
  amount: number
  created_at: string
}

export interface InvoiceLineInsert {
  invoice_id: string
  schedule_entry_id?: string | null
  description: string
  amount: number
}

export interface InvoiceLineUpdate {
  description?: string
  amount?: number
}

// ============================================================================
// Schedule Entry Extensions (for billing)
// ============================================================================

export interface ScheduleEntryBilling {
  client_id: string | null
  amount: number | null
}

export interface ScheduleEntryWithBilling {
  id: string
  user_id: string
  staff_member_id: string | null
  client_id: string | null
  scheduled_date: string
  start_time: string
  end_time: string | null
  description: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  amount: number | null
  created_at: string
  updated_at: string
  // Joined data
  staff_member?: {
    id: string
    first_name: string
    last_name: string
  } | null
  client?: {
    id: string
    name: string
  } | null
  // Invoice status
  is_invoiced?: boolean
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface ClientService {
  // CRUD operations
  getAll(filters?: ClientFilters): Promise<Client[]>
  getById(id: string): Promise<Client | null>
  create(client: ClientInsert): Promise<Client>
  update(id: string, client: ClientUpdate): Promise<Client>
  delete(id: string): Promise<void>
}

export interface InvoiceService {
  // CRUD operations
  getAll(filters?: InvoiceFilters): Promise<Invoice[]>
  getById(id: string): Promise<InvoiceWithLines | null>
  create(invoice: InvoiceInsert, lineItems: InvoiceLineInsert[]): Promise<Invoice>
  update(id: string, invoice: InvoiceUpdate): Promise<Invoice>
  delete(id: string): Promise<void>

  // Status operations
  markAsSent(id: string): Promise<Invoice>
  markAsPaid(id: string, paymentDate: string): Promise<Invoice>
  cancel(id: string): Promise<Invoice>

  // Line operations
  addLine(invoiceId: string, line: InvoiceLineInsert): Promise<InvoiceLine>
  updateLine(lineId: string, line: InvoiceLineUpdate): Promise<InvoiceLine>
  removeLine(lineId: string): Promise<void>

  // Utility
  generateInvoiceNumber(): Promise<string>
  getUnbilledInterventions(clientId: string): Promise<ScheduleEntryWithBilling[]>
}

// ============================================================================
// Component Props
// ============================================================================

export interface ClientFormProps {
  client?: Client
  onSubmit: (client: ClientInsert | ClientUpdate) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export interface ClientListProps {
  clients: Client[]
  loading?: boolean
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onSelect?: (client: Client) => void
}

export interface InvoiceFormProps {
  clients: Client[]
  unbilledInterventions: ScheduleEntryWithBilling[]
  onSubmit: (invoice: InvoiceInsert, lines: InvoiceLineInsert[]) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export interface InvoiceListProps {
  invoices: Invoice[]
  loading?: boolean
  onView: (invoice: Invoice) => void
  onStatusChange?: (invoice: Invoice, newStatus: InvoiceStatus) => void
}

export interface InvoiceDetailProps {
  invoice: InvoiceWithLines
  onMarkSent?: () => void
  onMarkPaid?: (paymentDate: string) => void
  onCancel?: () => void
  onPrint?: () => void
}

export interface InvoiceCardProps {
  invoice: Invoice
  onClick?: () => void
}

// ============================================================================
// Utility Types
// ============================================================================

export interface MoneyFormat {
  value: number
  formatted: string
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatInvoiceNumber(year: number, sequence: number): string {
  return `FACT-${year}-${String(sequence).padStart(4, '0')}`
}
