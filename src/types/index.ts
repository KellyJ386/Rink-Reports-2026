export type {
  UserRole,
  ChecklistType,
  Recurrence,
  FuelType,
  EquipmentType,
  IncidentType,
  InjuredType,
  SwapStatus,
  DepthSource,
  Json,
  Database,
} from './database'

// Convenience row types extracted from the Database type
import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Facility = Database['public']['Tables']['facilities']['Row']
export type ModuleSetting = Database['public']['Tables']['module_settings']['Row']
export type DailyReportTab = Database['public']['Tables']['daily_report_tabs']['Row']
export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']
export type ChecklistEntry = Database['public']['Tables']['checklist_entries']['Row']
export type IceDepthTemplate = Database['public']['Tables']['ice_depth_templates']['Row']
export type IceDepthPoint = Database['public']['Tables']['ice_depth_points']['Row']
export type IceDepthReading = Database['public']['Tables']['ice_depth_readings']['Row']
export type Equipment = Database['public']['Tables']['equipment']['Row']
export type IceCut = Database['public']['Tables']['ice_cuts']['Row']
export type EdgingLog = Database['public']['Tables']['edging_logs']['Row']
export type BladeChange = Database['public']['Tables']['blade_changes']['Row']
export type CircleCheck = Database['public']['Tables']['circle_checks']['Row']
export type CircleCheckItem = Database['public']['Tables']['circle_check_items']['Row']
export type CircleCheckResponse = Database['public']['Tables']['circle_check_responses']['Row']
export type Position = Database['public']['Tables']['positions']['Row']
export type Shift = Database['public']['Tables']['shifts']['Row']
export type Availability = Database['public']['Tables']['availability']['Row']
export type ShiftSwap = Database['public']['Tables']['shift_swaps']['Row']
export type Incident = Database['public']['Tables']['incidents']['Row']
export type RefrigerationEquipment = Database['public']['Tables']['refrigeration_equipment']['Row']
export type RefrigerationReadingType = Database['public']['Tables']['refrigeration_reading_types']['Row']
export type RefrigerationLog = Database['public']['Tables']['refrigeration_logs']['Row']
export type RefrigerationReading = Database['public']['Tables']['refrigeration_readings']['Row']
export type AirQualityMetric = Database['public']['Tables']['air_quality_metrics']['Row']
export type AirQualityReading = Database['public']['Tables']['air_quality_readings']['Row']
export type AirQualityReadingValue = Database['public']['Tables']['air_quality_reading_values']['Row']
export type AirQualityJurisdiction = Database['public']['Tables']['air_quality_jurisdictions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type RefrigerationAlert = Database['public']['Tables']['refrigeration_alerts']['Row']
export type AirQualityJurisdictionThreshold = Database['public']['Tables']['air_quality_jurisdiction_thresholds']['Row']

// Module identifiers
export type ModuleId =
  | 'daily-reports'
  | 'ice-depth'
  | 'ice-operations'
  | 'scheduling'
  | 'incidents'
  | 'refrigeration'
  | 'air-quality'
  | 'admin'

// Dashboard module button config
export interface ModuleConfig {
  id: ModuleId
  name: string
  icon: string
  href: string
  color: string
  adminOnly?: boolean
}

// Body diagram regions for incident reporting
export type BodyRegion =
  | 'head_front' | 'head_back'
  | 'face' | 'neck'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_upper_arm' | 'right_upper_arm'
  | 'left_elbow' | 'right_elbow'
  | 'left_forearm' | 'right_forearm'
  | 'left_wrist' | 'right_wrist'
  | 'left_hand' | 'right_hand'
  | 'chest' | 'abdomen'
  | 'upper_back' | 'lower_back'
  | 'hip_pelvis'
  | 'left_upper_leg' | 'right_upper_leg'
  | 'left_knee' | 'right_knee'
  | 'left_lower_leg' | 'right_lower_leg'
  | 'left_ankle' | 'right_ankle'
  | 'left_foot' | 'right_foot'

// Offline sync queue item
export interface SyncQueueItem {
  id: string
  endpoint: string
  method: 'POST' | 'PUT' | 'DELETE'
  body: Record<string, unknown>
  timestamp: number
  retries: number
}

// Notification preferences
export interface NotificationPreferences {
  inApp: boolean
  email: boolean
  sms: boolean
  criticalOnly: boolean
}

// Insert/Update helper types
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
