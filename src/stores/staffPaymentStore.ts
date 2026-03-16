/**
 * Staff Payment Store
 * Manages staff payment state with SolidJS createStore
 */

import { createStore } from 'solid-js/store'
import type {
  StaffPaymentWithStaff,
  StaffPaymentInsert,
  StaffPaymentUpdate,
  StaffPaymentFilters,
} from '../lib/types/payments.types'
import {
  getStaffPayments,
  getStaffPaymentsByStaffMember,
  createStaffPayment,
  updateStaffPayment,
  deleteStaffPayment,
} from '../services/staff-payment.service'

interface StaffPaymentState {
  payments: StaffPaymentWithStaff[]
  loading: boolean
  error: string | null
  initialized: boolean
  filters: StaffPaymentFilters
}

const initialState: StaffPaymentState = {
  payments: [],
  loading: false,
  error: null,
  initialized: false,
  filters: {},
}

const [state, setState] = createStore<StaffPaymentState>(initialState)

const actions = {
  /**
   * Fetch all payments
   */
  async fetch() {
    setState({ loading: true, error: null })
    const result = await getStaffPayments()
    setState({
      payments: result.data || [],
      loading: false,
      error: result.error,
      initialized: true,
    })
    return result
  },

  /**
   * Fetch payments for a specific staff member
   */
  async fetchByStaffMember(staffMemberId: string) {
    setState({ loading: true, error: null })
    const result = await getStaffPaymentsByStaffMember(staffMemberId)
    // Convert StaffPayment[] to StaffPaymentWithStaff[] (staff_member will be null)
    const paymentsWithStaff: StaffPaymentWithStaff[] = (result.data || []).map((p) => ({
      ...p,
      staff_member: null,
    }))
    setState({
      payments: paymentsWithStaff,
      loading: false,
      error: result.error,
      initialized: true,
    })
    return result
  },

  /**
   * Create a new payment
   */
  async add(data: StaffPaymentInsert) {
    const result = await createStaffPayment(data)
    if (!result.error && result.data) {
      // Add to local state with null staff_member (will be fetched on next load)
      const newPayment: StaffPaymentWithStaff = {
        ...result.data,
        staff_member: null,
      }
      setState('payments', (prev) => [newPayment, ...prev])
    }
    return result
  },

  /**
   * Update an existing payment
   */
  async update(id: string, data: StaffPaymentUpdate) {
    const result = await updateStaffPayment(id, data)
    if (!result.error && result.data) {
      setState('payments', (payment) => payment.id === id, {
        ...result.data,
      })
    }
    return result
  },

  /**
   * Delete a payment
   */
  async delete(id: string) {
    // Optimistic update
    const previousPayments = [...state.payments]
    setState('payments', (payments) => payments.filter((p) => p.id !== id))

    const result = await deleteStaffPayment(id)
    if (result.error) {
      // Rollback on error
      setState('payments', previousPayments)
    }
    return result
  },

  /**
   * Set filters
   */
  setFilters(filters: StaffPaymentFilters) {
    setState('filters', filters)
  },

  /**
   * Reset store to initial state
   */
  reset() {
    setState(initialState)
  },
}

export const staffPaymentStore = { state, actions }
