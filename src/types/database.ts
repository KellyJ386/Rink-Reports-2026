export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole =
  | 'super_admin'
  | 'facility_admin'
  | 'manager'
  | 'supervisor'
  | 'staff'
  | 'read_only'

export type ChecklistType = 'opening' | 'closing' | 'daily'

export type Recurrence = 'daily' | 'weekly' | 'monthly' | 'seasonal'

export type FuelType = 'gas' | 'electric'

export type EquipmentType = 'zamboni' | 'edger' | 'other'

export type IncidentType = 'incident' | 'accident'

export type InjuredType = 'patron' | 'staff'

export type SwapStatus = 'pending' | 'approved' | 'denied'

export type DepthSource = 'manual' | 'bluetooth'

export type Database = {
  public: {
    Tables: {
      facilities: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip: string
          timezone: string
          phone: string
          logo_url: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          data_retention_years: number
          incident_retention_years: number
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string
          city?: string
          state?: string
          zip?: string
          timezone?: string
          phone?: string
          logo_url?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          data_retention_years?: number
          incident_retention_years?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          timezone?: string
          phone?: string
          logo_url?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          data_retention_years?: number
          incident_retention_years?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          facility_id: string | null
          full_name: string
          email: string
          role: UserRole
          position: string | null
          certifications: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          facility_id?: string | null
          full_name: string
          email: string
          role?: UserRole
          position?: string | null
          certifications?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string | null
          full_name?: string
          email?: string
          role?: UserRole
          position?: string | null
          certifications?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_settings: {
        Row: {
          id: string
          facility_id: string
          module: string
          enabled: boolean
          role_access: Json
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          module: string
          enabled?: boolean
          role_access?: Json
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          module?: string
          enabled?: boolean
          role_access?: Json
          created_at?: string
        }
        Relationships: []
      }
      daily_report_tabs: {
        Row: {
          id: string
          facility_id: string
          name: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          id: string
          tab_id: string
          text: string
          checklist_type: ChecklistType
          sort_order: number
          recurrence: Recurrence
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tab_id: string
          text: string
          checklist_type: ChecklistType
          sort_order?: number
          recurrence?: Recurrence
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tab_id?: string
          text?: string
          checklist_type?: ChecklistType
          sort_order?: number
          recurrence?: Recurrence
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      checklist_entries: {
        Row: {
          id: string
          checklist_item_id: string
          user_id: string
          facility_id: string
          checked: boolean
          date: string
          checked_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          checklist_item_id: string
          user_id: string
          facility_id: string
          checked?: boolean
          date: string
          checked_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          checklist_item_id?: string
          user_id?: string
          facility_id?: string
          checked?: boolean
          date?: string
          checked_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      ice_depth_templates: {
        Row: {
          id: string
          facility_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      ice_depth_points: {
        Row: {
          id: string
          template_id: string
          point_number: number
          x_percent: number
          y_percent: number
          label: string | null
        }
        Insert: {
          id?: string
          template_id: string
          point_number: number
          x_percent: number
          y_percent: number
          label?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          point_number?: number
          x_percent?: number
          y_percent?: number
          label?: string | null
        }
        Relationships: []
      }
      ice_depth_readings: {
        Row: {
          id: string
          point_id: string
          template_id: string
          facility_id: string
          user_id: string
          value: number
          depth_inches: number
          source: DepthSource
          recorded_by: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          point_id: string
          template_id?: string
          facility_id: string
          user_id?: string
          value?: number
          depth_inches?: number
          source?: DepthSource
          recorded_by?: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          point_id?: string
          template_id?: string
          facility_id?: string
          user_id?: string
          value?: number
          depth_inches?: number
          source?: DepthSource
          recorded_by?: string
          recorded_at?: string
          created_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          id: string
          facility_id: string
          name: string
          type: EquipmentType
          fuel_type: FuelType
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          type: EquipmentType
          fuel_type: FuelType
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          type?: EquipmentType
          fuel_type?: FuelType
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      ice_cuts: {
        Row: {
          id: string
          facility_id: string
          user_id: string
          equipment_id: string
          rink_name: string
          machine_hours: number
          ice_taken: number
          water_used: number
          cut_number: number | null
          water_temperature: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          equipment_id: string
          rink_name: string
          machine_hours?: number
          ice_taken?: number
          water_used?: number
          cut_number?: number | null
          water_temperature?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          equipment_id?: string
          rink_name?: string
          machine_hours?: number
          ice_taken?: number
          water_used?: number
          cut_number?: number | null
          water_temperature?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      edging_logs: {
        Row: {
          id: string
          facility_id: string
          user_id: string
          equipment_id: string | null
          rink_name: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          equipment_id?: string | null
          rink_name: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          equipment_id?: string | null
          rink_name?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      blade_changes: {
        Row: {
          id: string
          facility_id: string
          user_id: string
          equipment_id: string
          blade_type: string | null
          reason: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          equipment_id: string
          blade_type?: string | null
          reason?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          equipment_id?: string
          blade_type?: string | null
          reason?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      circle_checks: {
        Row: {
          id: string
          facility_id: string
          user_id: string
          equipment_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          equipment_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          equipment_id?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      circle_check_items: {
        Row: {
          id: string
          facility_id: string
          equipment_id: string
          text: string
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          facility_id: string
          equipment_id: string
          text: string
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          facility_id?: string
          equipment_id?: string
          text?: string
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      circle_check_responses: {
        Row: {
          id: string
          circle_check_id: string
          item_id: string
          passed: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          circle_check_id: string
          item_id: string
          passed: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          circle_check_id?: string
          item_id?: string
          passed?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          id: string
          facility_id: string
          name: string
          color: string
          required_certifications: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          color?: string
          required_certifications?: string[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          color?: string
          required_certifications?: string[]
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          id: string
          facility_id: string
          user_id: string | null
          position_id: string
          assigned_to: string | null
          date: string
          start_time: string
          end_time: string
          is_open: boolean
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id?: string | null
          position_id?: string
          assigned_to?: string | null
          date?: string
          start_time: string
          end_time: string
          is_open?: boolean
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string | null
          position_id?: string
          assigned_to?: string | null
          date?: string
          start_time?: string
          end_time?: string
          is_open?: boolean
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      availability: {
        Row: {
          id: string
          user_id: string
          facility_id: string
          date: string
          start_time: string
          end_time: string
          recurring: boolean
          day_of_week: number | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          facility_id: string
          date?: string
          start_time: string
          end_time: string
          recurring?: boolean
          day_of_week?: number | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          facility_id?: string
          date?: string
          start_time?: string
          end_time?: string
          recurring?: boolean
          day_of_week?: number | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shift_swaps: {
        Row: {
          id: string
          shift_id: string
          requester_id: string
          target_id: string
          status: SwapStatus
          approved_by: string | null
          note: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          shift_id: string
          requester_id: string
          target_id: string
          status?: SwapStatus
          approved_by?: string | null
          note?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          shift_id?: string
          requester_id?: string
          target_id?: string
          status?: SwapStatus
          approved_by?: string | null
          note?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          id: string
          facility_id: string
          user_id: string
          type: IncidentType
          title: string | null
          date: string | null
          time: string | null
          date_time: string
          location: string
          description: string
          injured_name: string | null
          injured_type: InjuredType | null
          body_diagram_data: Json | null
          body_regions: string[] | null
          severity: string | null
          first_aid_given: boolean | null
          equipment_involved: string | null
          damage_description: string | null
          estimated_cost: number | null
          actions_taken: string | null
          witnesses: string | null
          category: string | null
          reported_by: string
          reported_at: string
          updated_by: string | null
          updated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id?: string
          type: IncidentType
          title?: string | null
          date?: string | null
          time?: string | null
          date_time?: string
          location?: string
          description: string
          injured_name?: string | null
          injured_type?: InjuredType | null
          body_diagram_data?: Json | null
          body_regions?: string[] | null
          severity?: string | null
          first_aid_given?: boolean | null
          equipment_involved?: string | null
          damage_description?: string | null
          estimated_cost?: number | null
          actions_taken?: string | null
          witnesses?: string | null
          category?: string | null
          reported_by: string
          reported_at?: string
          updated_by?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          type?: IncidentType
          title?: string | null
          date?: string | null
          time?: string | null
          date_time?: string
          location?: string
          description?: string
          injured_name?: string | null
          injured_type?: InjuredType | null
          body_diagram_data?: Json | null
          body_regions?: string[] | null
          severity?: string | null
          first_aid_given?: boolean | null
          equipment_involved?: string | null
          damage_description?: string | null
          estimated_cost?: number | null
          actions_taken?: string | null
          witnesses?: string | null
          category?: string | null
          reported_by?: string
          reported_at?: string
          updated_by?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      refrigeration_equipment: {
        Row: {
          id: string
          facility_id: string
          name: string
          equipment_type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          equipment_type: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          equipment_type?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      refrigeration_reading_types: {
        Row: {
          id: string
          equipment_id: string
          name: string
          unit: string
          min_threshold: number | null
          max_threshold: number | null
          min_value: number | null
          max_value: number | null
        }
        Insert: {
          id?: string
          equipment_id: string
          name: string
          unit: string
          min_threshold?: number | null
          max_threshold?: number | null
          min_value?: number | null
          max_value?: number | null
        }
        Update: {
          id?: string
          equipment_id?: string
          name?: string
          unit?: string
          min_threshold?: number | null
          max_threshold?: number | null
          min_value?: number | null
          max_value?: number | null
        }
        Relationships: []
      }
      refrigeration_logs: {
        Row: {
          id: string
          equipment_id: string
          facility_id: string
          user_id: string
          notes: string | null
          recorded_by: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          facility_id: string
          user_id?: string
          notes?: string | null
          recorded_by?: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          facility_id?: string
          user_id?: string
          notes?: string | null
          recorded_by?: string
          recorded_at?: string
          created_at?: string
        }
        Relationships: []
      }
      refrigeration_readings: {
        Row: {
          id: string
          log_id: string
          reading_type_id: string
          value: number
          out_of_range: boolean
          recorded_by: string
        }
        Insert: {
          id?: string
          log_id: string
          reading_type_id: string
          value: number
          out_of_range?: boolean
          recorded_by?: string
        }
        Update: {
          id?: string
          log_id?: string
          reading_type_id?: string
          value?: number
          out_of_range?: boolean
          recorded_by?: string
        }
        Relationships: []
      }
      air_quality_metrics: {
        Row: {
          id: string
          facility_id: string
          name: string
          unit: string
          min_threshold: number | null
          max_threshold: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          name: string
          unit: string
          min_threshold?: number | null
          max_threshold?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          name?: string
          unit?: string
          min_threshold?: number | null
          max_threshold?: number | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      air_quality_readings: {
        Row: {
          id: string
          facility_id: string
          user_id: string
          location: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          user_id: string
          location: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          user_id?: string
          location?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      air_quality_reading_values: {
        Row: {
          id: string
          reading_id: string
          metric_id: string
          value: number
          out_of_range: boolean
        }
        Insert: {
          id?: string
          reading_id: string
          metric_id: string
          value: number
          out_of_range?: boolean
        }
        Update: {
          id?: string
          reading_id?: string
          metric_id?: string
          value?: number
          out_of_range?: boolean
        }
        Relationships: []
      }
      air_quality_jurisdictions: {
        Row: {
          id: string
          state_code: string
          name: string
          metrics: Json
        }
        Insert: {
          id?: string
          state_code: string
          name: string
          metrics: Json
        }
        Update: {
          id?: string
          state_code?: string
          name?: string
          metrics?: Json
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          id: string
          facility_id: string
          event_type: string
          channel: string
          recipients: string[] | null
          recipient_roles: string[] | null
          is_enabled: boolean
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          event_type: string
          channel: string
          recipients?: string[] | null
          recipient_roles?: string[] | null
          is_enabled?: boolean
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          event_type?: string
          channel?: string
          recipients?: string[] | null
          recipient_roles?: string[] | null
          is_enabled?: boolean
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      swap_requests: {
        Row: {
          id: string
          facility_id: string
          shift_id: string
          requested_by: string
          requested_to: string | null
          reason: string | null
          status: SwapStatus
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          shift_id: string
          requested_by: string
          requested_to?: string | null
          reason?: string | null
          status?: SwapStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          shift_id?: string
          requested_by?: string
          requested_to?: string | null
          reason?: string | null
          status?: SwapStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          facility_id: string
          type: string
          title: string
          message: string
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          facility_id: string
          type: string
          title: string
          message: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          facility_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      checklist_type: ChecklistType
      recurrence: Recurrence
      fuel_type: FuelType
      equipment_type: EquipmentType
      incident_type: IncidentType
      injured_type: InjuredType
      swap_status: SwapStatus
      depth_source: DepthSource
    }
    CompositeTypes: Record<string, never>
  }
}
