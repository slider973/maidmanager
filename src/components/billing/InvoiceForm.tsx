/**
 * InvoiceForm Component
 * Form for creating a new invoice from unbilled interventions
 */

import { createSignal, Show, For, createEffect, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { LoadingButton } from '../ui/LoadingButton'
import { ClientSelect } from './ClientSelect'
import { getUnbilledInterventions } from '../../services/schedule.service'
import { formatMoney } from '../../lib/types/billing.types'
import type {
  InvoiceInsert,
  InvoiceLineInsert,
} from '../../lib/types/billing.types'
import type { ScheduleEntryWithStaff } from '../../lib/types/database'

interface InvoiceFormProps {
  onSubmit: (
    invoice: InvoiceInsert,
    lines: Omit<InvoiceLineInsert, 'invoice_id'>[]
  ) => Promise<{ error: string | null }>
  onCancel?: () => void
}

interface SelectedIntervention {
  id: string
  description: string
  amount: number
  date: string
}

export const InvoiceForm: Component<InvoiceFormProps> = (props) => {
  const [clientId, setClientId] = createSignal('')
  const [invoiceDate, setInvoiceDate] = createSignal(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = createSignal('')
  const [selectedInterventions, setSelectedInterventions] = createSignal<
    SelectedIntervention[]
  >([])
  const [unbilledInterventions, setUnbilledInterventions] = createSignal<
    ScheduleEntryWithStaff[]
  >([])
  const [manualLines, setManualLines] = createSignal<
    { description: string; amount: string }[]
  >([])
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [loadingInterventions, setLoadingInterventions] = createSignal(false)

  // Fetch unbilled interventions when client changes
  createEffect(async () => {
    const client = clientId()
    if (client) {
      setLoadingInterventions(true)
      setSelectedInterventions([])
      const result = await getUnbilledInterventions(client)
      if (!result.error) {
        setUnbilledInterventions(result.data || [])
      }
      setLoadingInterventions(false)
    } else {
      setUnbilledInterventions([])
      setSelectedInterventions([])
    }
  })

  const toggleIntervention = (intervention: ScheduleEntryWithStaff) => {
    const current = selectedInterventions()
    const exists = current.find((i) => i.id === intervention.id)

    if (exists) {
      setSelectedInterventions(current.filter((i) => i.id !== intervention.id))
    } else {
      setSelectedInterventions([
        ...current,
        {
          id: intervention.id,
          description: `${intervention.description} - ${formatDate(intervention.scheduled_date)}`,
          amount: intervention.amount || 0,
          date: intervention.scheduled_date,
        },
      ])
    }
  }

  const isSelected = (id: string) =>
    selectedInterventions().some((i) => i.id === id)

  const addManualLine = () => {
    setManualLines([...manualLines(), { description: '', amount: '' }])
  }

  const updateManualLine = (
    index: number,
    field: 'description' | 'amount',
    value: string
  ) => {
    setManualLines((lines) =>
      lines.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    )
  }

  const removeManualLine = (index: number) => {
    setManualLines((lines) => lines.filter((_, i) => i !== index))
  }

  const totalAmount = createMemo(() => {
    const interventionTotal = selectedInterventions().reduce(
      (sum, i) => sum + i.amount,
      0
    )
    const manualTotal = manualLines().reduce((sum, line) => {
      const amount = parseFloat(line.amount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    return interventionTotal + manualTotal
  })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    if (!clientId()) {
      setError('Veuillez sélectionner un client')
      return
    }

    // Build lines from selections and manual entries
    const lines: Omit<InvoiceLineInsert, 'invoice_id'>[] = []

    // Add selected interventions
    for (const intervention of selectedInterventions()) {
      if (intervention.amount <= 0) {
        setError(
          `L'intervention "${intervention.description}" n'a pas de montant défini`
        )
        return
      }
      lines.push({
        schedule_entry_id: intervention.id,
        description: intervention.description,
        amount: intervention.amount,
      })
    }

    // Add manual lines
    for (const line of manualLines()) {
      if (!line.description.trim()) {
        setError('Toutes les lignes doivent avoir une description')
        return
      }
      const amount = parseFloat(line.amount)
      if (isNaN(amount) || amount <= 0) {
        setError('Toutes les lignes doivent avoir un montant valide')
        return
      }
      lines.push({
        description: line.description,
        amount,
      })
    }

    if (lines.length === 0) {
      setError('La facture doit contenir au moins une ligne')
      return
    }

    setLoading(true)

    const invoiceData: InvoiceInsert = {
      client_id: clientId(),
      invoice_date: invoiceDate(),
      notes: notes() || null,
    }

    const result = await props.onSubmit(invoiceData, lines)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Reset form
    setClientId('')
    setInvoiceDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setSelectedInterventions([])
    setManualLines([])
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} class="invoice-form">
      <Show when={error()}>
        <div class="error-message">
          <svg
            class="error-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span class="error-text">{error()}</span>
        </div>
      </Show>

      {/* Client Selection */}
      <ClientSelect
        value={clientId()}
        onChange={setClientId}
        label="Client"
        placeholder="Sélectionner un client"
        id="invoice-client"
        required
      />

      {/* Invoice Date */}
      <div class="form-group">
        <label class="form-label" for="invoice-date">
          Date de facture
        </label>
        <input
          class="form-input"
          id="invoice-date"
          type="date"
          value={invoiceDate()}
          onInput={(e) => setInvoiceDate(e.currentTarget.value)}
          required
        />
      </div>

      {/* Unbilled Interventions */}
      <Show when={clientId()}>
        <div class="form-group">
          <label class="form-label">Interventions à facturer</label>

          <Show when={loadingInterventions()}>
            <div class="loading-inline">
              <div class="spinner spinner-sm" />
              <span>Chargement...</span>
            </div>
          </Show>

          <Show when={!loadingInterventions() && unbilledInterventions().length === 0}>
            <p class="form-hint">Aucune intervention non facturée pour ce client</p>
          </Show>

          <Show when={!loadingInterventions() && unbilledInterventions().length > 0}>
            <div class="intervention-list">
              <For each={unbilledInterventions()}>
                {(intervention) => (
                  <label
                    class={`intervention-item ${isSelected(intervention.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(intervention.id)}
                      onChange={() => toggleIntervention(intervention)}
                    />
                    <div class="intervention-info">
                      <span class="intervention-date">
                        {formatDate(intervention.scheduled_date)}
                      </span>
                      <span class="intervention-description">
                        {intervention.description}
                      </span>
                    </div>
                    <span class="intervention-amount">
                      {intervention.amount
                        ? formatMoney(intervention.amount)
                        : 'Aucun montant'}
                    </span>
                  </label>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>

      {/* Manual Lines */}
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label">Lignes supplémentaires</label>
          <button type="button" class="btn btn-sm btn-ghost" onClick={addManualLine}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter une ligne
          </button>
        </div>

        <Show when={manualLines().length > 0}>
          <div class="manual-lines">
            <For each={manualLines()}>
              {(line, index) => (
                <div class="manual-line">
                  <input
                    type="text"
                    class="form-input"
                    placeholder="Description"
                    value={line.description}
                    onInput={(e) =>
                      updateManualLine(index(), 'description', e.currentTarget.value)
                    }
                  />
                  <div class="amount-input-wrapper">
                    <input
                      type="text"
                      inputmode="decimal"
                      class="form-input amount-input"
                      placeholder="0.00"
                      value={line.amount}
                      onInput={(e) =>
                        updateManualLine(index(), 'amount', e.currentTarget.value)
                      }
                    />
                    <span class="amount-input-currency">CHF</span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-icon btn-ghost"
                    onClick={() => removeManualLine(index())}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Notes */}
      <div class="form-group">
        <label class="form-label" for="invoice-notes">
          Notes (optionnel)
        </label>
        <textarea
          class="form-input form-textarea"
          id="invoice-notes"
          placeholder="Notes pour la facture..."
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />
      </div>

      {/* Total */}
      <div class="invoice-total">
        <span class="invoice-total-label">Total HT</span>
        <span class="invoice-total-amount">{formatMoney(totalAmount())}</span>
      </div>

      {/* Actions */}
      <div class="form-actions">
        <LoadingButton
          type="submit"
          class="btn-primary"
          loading={loading()}
          loadingText="Création en cours..."
          disabled={totalAmount() <= 0}
        >
          Créer la facture
        </LoadingButton>

        <Show when={props.onCancel}>
          <button type="button" class="btn btn-secondary" onClick={props.onCancel}>
            Annuler
          </button>
        </Show>
      </div>
    </form>
  )
}
