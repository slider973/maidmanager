/**
 * Database types for Supabase tables
 * Based on data-model.md specifications
 */

// Staff position enum values
export const STAFF_POSITIONS = [
  'housekeeper',
  'gardener',
  'cook',
  'driver',
  'nanny',
  'guard',
  'other'
] as const;

export type StaffPosition = typeof STAFF_POSITIONS[number];

// Position labels in French
export const POSITION_LABELS: Record<StaffPosition, string> = {
  housekeeper: 'Femme de ménage',
  gardener: 'Jardinier',
  cook: 'Cuisinier',
  driver: 'Chauffeur',
  nanny: 'Nounou',
  guard: 'Gardien',
  other: 'Autre'
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          staff_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          staff_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          staff_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_staff_account_id_fkey"
            columns: ["staff_account_id"]
            isOneToOne: true
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_info: string
          browser: string | null
          os: string | null
          ip_address: string | null
          last_active_at: string
          created_at: string
          is_current: boolean
        }
        Insert: {
          id?: string
          user_id: string
          device_info: string
          browser?: string | null
          os?: string | null
          ip_address?: string | null
          last_active_at?: string
          created_at?: string
          is_current?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          device_info?: string
          browser?: string | null
          os?: string | null
          ip_address?: string | null
          last_active_at?: string
          created_at?: string
          is_current?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      staff_members: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          position: StaffPosition
          position_custom: string | null
          phone: string | null
          email: string | null
          start_date: string | null
          notes: string | null
          is_active: boolean
          hourly_rate_cents: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          position: StaffPosition
          position_custom?: string | null
          phone?: string | null
          email?: string | null
          start_date?: string | null
          notes?: string | null
          is_active?: boolean
          hourly_rate_cents?: number
        }
        Update: {
          first_name?: string
          last_name?: string
          position?: StaffPosition
          position_custom?: string | null
          phone?: string | null
          email?: string | null
          start_date?: string | null
          notes?: string | null
          is_active?: boolean
          hourly_rate_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      schedule_entries: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id?: string
          staff_member_id: string
          client_id?: string | null
          scheduled_date: string
          start_time: string
          end_time?: string | null
          description: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          staff_member_id?: string | null
          client_id?: string | null
          scheduled_date?: string
          start_time?: string
          end_time?: string | null
          description?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          email: string | null
          phone: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          address?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          address?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          invoice_number: string
          client_name: string
          client_address: string | null
          client_email: string | null
          status: 'draft' | 'sent' | 'paid' | 'cancelled'
          total_amount: number
          invoice_date: string
          payment_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          client_id: string
          invoice_number: string
          client_name: string
          client_address?: string | null
          client_email?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'cancelled'
          total_amount?: number
          invoice_date?: string
          payment_date?: string | null
          notes?: string | null
        }
        Update: {
          status?: 'draft' | 'sent' | 'paid' | 'cancelled'
          total_amount?: number
          invoice_date?: string
          payment_date?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_lines: {
        Row: {
          id: string
          invoice_id: string
          schedule_entry_id: string | null
          description: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          schedule_entry_id?: string | null
          description: string
          amount: number
        }
        Update: {
          description?: string
          amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_schedule_entry_id_fkey"
            columns: ["schedule_entry_id"]
            isOneToOne: false
            referencedRelation: "schedule_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          staff_member_id: string | null
          title: string
          description: string | null
          due_date: string
          priority: 'low' | 'normal' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          staff_member_id: string
          title: string
          description?: string | null
          due_date: string
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          staff_member_id?: string | null
          title?: string
          description?: string | null
          due_date?: string
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          }
        ]
      }
      work_sessions: {
        Row: {
          id: string
          user_id: string
          staff_member_id: string
          schedule_entry_id: string | null
          session_date: string
          duration_minutes: number
          hourly_rate_cents: number
          amount_cents: number
          description: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          staff_member_id: string
          schedule_entry_id?: string | null
          session_date: string
          duration_minutes: number
          hourly_rate_cents: number
          description: string
          notes?: string | null
        }
        Update: {
          session_date?: string
          duration_minutes?: number
          hourly_rate_cents?: number
          description?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_schedule_entry_id_fkey"
            columns: ["schedule_entry_id"]
            isOneToOne: false
            referencedRelation: "schedule_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      staff_payments: {
        Row: {
          id: string
          user_id: string
          staff_member_id: string
          amount_cents: number
          payment_date: string
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          staff_member_id: string
          amount_cents: number
          payment_date: string
          payment_method?: string | null
          notes?: string | null
        }
        Update: {
          amount_cents?: number
          payment_date?: string
          payment_method?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_payments_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          }
        ]
      }
      room_types: {
        Row: {
          id: string
          user_id: string | null
          name: string
          name_fr: string
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          name_fr: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          name_fr?: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "room_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      action_types: {
        Row: {
          id: string
          user_id: string | null
          name: string
          name_fr: string
          position_filter: string[] | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          name_fr: string
          position_filter?: string[] | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          name_fr?: string
          position_filter?: string[] | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "action_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          staff_member_id: string
          client_id: string
          clock_in_at: string
          clock_out_at: string | null
          duration_minutes: number | null
          work_session_id: string | null
          status: 'open' | 'closed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          staff_member_id: string
          client_id: string
          clock_in_at?: string
          notes?: string | null
        }
        Update: {
          clock_out_at?: string | null
          duration_minutes?: number | null
          work_session_id?: string | null
          status?: 'open' | 'closed' | 'cancelled'
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_work_session_id_fkey"
            columns: ["work_session_id"]
            isOneToOne: false
            referencedRelation: "work_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      room_actions: {
        Row: {
          id: string
          time_entry_id: string
          room_type_id: string
          action_type_id: string
          performed_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          time_entry_id: string
          room_type_id: string
          action_type_id: string
          performed_at?: string
          notes?: string | null
        }
        Update: {
          room_type_id?: string
          action_type_id?: string
          performed_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_actions_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_actions_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_actions_action_type_id_fkey"
            columns: ["action_type_id"]
            isOneToOne: false
            referencedRelation: "action_types"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type UserSessionInsert = Database['public']['Tables']['user_sessions']['Insert']
export type UserSessionUpdate = Database['public']['Tables']['user_sessions']['Update']

export type StaffMember = Database['public']['Tables']['staff_members']['Row']
export type StaffMemberInsert = Database['public']['Tables']['staff_members']['Insert']
export type StaffMemberUpdate = Database['public']['Tables']['staff_members']['Update']

// Schedule status enum values
export const SCHEDULE_STATUSES = ['scheduled', 'completed', 'cancelled'] as const
export type ScheduleStatus = typeof SCHEDULE_STATUSES[number]

// Status labels in French
export const STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé'
}

// Schedule entry types
export interface ScheduleEntry {
  id: string
  user_id: string
  staff_member_id: string | null
  client_id: string | null
  scheduled_date: string
  start_time: string
  end_time: string | null
  description: string
  status: ScheduleStatus
  notes: string | null
  amount: number | null
  created_at: string
  updated_at: string
}

export interface ScheduleEntryWithStaff extends ScheduleEntry {
  staff_member: {
    id: string
    first_name: string
    last_name: string
    position: string
  } | null
  client: {
    id: string
    name: string
  } | null
}

export interface ScheduleEntryInsert {
  staff_member_id: string
  client_id?: string | null
  scheduled_date: string
  start_time: string
  end_time?: string | null
  description: string
  status?: ScheduleStatus
  notes?: string | null
  amount?: number | null
}

export interface ScheduleEntryUpdate {
  staff_member_id?: string | null
  client_id?: string | null
  scheduled_date?: string
  start_time?: string
  end_time?: string | null
  description?: string
  status?: ScheduleStatus
  notes?: string | null
  amount?: number | null
}

export interface ScheduleFilters {
  staffMemberId?: string
  clientId?: string
  status?: ScheduleStatus
  dateFrom?: string
  dateTo?: string
}

// Re-export task types for convenience
export * from './task.types'

// Re-export billing types for convenience
export * from './billing.types'

// Re-export payments types for convenience (except formatMoney which conflicts with billing.types)
export type {
  WorkSession,
  WorkSessionWithStaff,
  WorkSessionInsert,
  WorkSessionUpdate,
  StaffPayment,
  StaffPaymentWithStaff,
  StaffPaymentInsert,
  StaffPaymentUpdate,
  StaffBalance,
  GlobalBalance,
  HistoryEntryType,
  HistoryEntry,
  WorkSessionFilters,
  StaffPaymentFilters,
  PaymentMethod,
} from './payments.types'

export {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  parseMoney,
  hoursToMinutes,
  minutesToHours,
  formatDuration,
  calculateAmount,
} from './payments.types'

// ============================================================================
// Billing Types (Database Tables)
// ============================================================================

// Invoice status enum values
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

// Invoice status labels in French
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
