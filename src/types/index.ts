// Re-export Prisma types for convenience
export type {
  Role,
  FuelType,
  ChecklistType,
  Recurrence,
  IncidentType,
  InjuredType,
  SwapStatus,
  NotificationType,
} from '@prisma/client'

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
  | 'communication'

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
