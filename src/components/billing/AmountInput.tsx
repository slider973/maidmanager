/**
 * AmountInput Component
 * Input field for entering monetary amounts in CHF
 */

import { Show } from 'solid-js'
import type { Component } from 'solid-js'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  id?: string
  hint?: string
}

export const AmountInput: Component<AmountInputProps> = (props) => {
  const handleInput = (e: InputEvent) => {
    const input = e.currentTarget as HTMLInputElement
    let value = input.value

    // Allow only numbers and one decimal point
    value = value.replace(/[^0-9.,]/g, '')
    // Replace comma with dot for decimal
    value = value.replace(',', '.')
    // Only allow one decimal point
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].slice(0, 2)
    }

    props.onChange(value)
  }

  return (
    <div class="form-group">
      <Show when={props.label}>
        <label class="form-label" for={props.id || 'amount-input'}>
          {props.label}
        </label>
      </Show>
      <div class="amount-input-wrapper">
        <input
          type="text"
          inputmode="decimal"
          class="form-input amount-input"
          id={props.id || 'amount-input'}
          value={props.value}
          onInput={handleInput}
          placeholder={props.placeholder || '0.00'}
          required={props.required}
          disabled={props.disabled}
        />
        <span class="amount-input-currency">CHF</span>
      </div>
      <Show when={props.hint}>
        <span class="form-hint">{props.hint}</span>
      </Show>
    </div>
  )
}
