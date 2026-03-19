import { ModuleConfig } from '@/types'

// ─── Module Configuration ────────────────────────────────────────────────────

export const MODULES: ModuleConfig[] = [
  {
    id: 'daily-reports',
    name: 'Daily Reports',
    icon: 'clipboard-list',
    href: '/daily-reports',
    color: 'bg-navy',
  },
  {
    id: 'ice-depth',
    name: 'Ice Depth Management',
    icon: 'ruler',
    href: '/ice-depth',
    color: 'bg-blue-600',
  },
  {
    id: 'ice-operations',
    name: 'Ice Operations',
    icon: 'snowflake',
    href: '/ice-operations',
    color: 'bg-cyan-700',
  },
  {
    id: 'scheduling',
    name: 'Employee Scheduling',
    icon: 'calendar',
    href: '/scheduling',
    color: 'bg-purple-700',
  },
  {
    id: 'incidents',
    name: 'Incident Reporting',
    icon: 'alert-triangle',
    href: '/incidents',
    color: 'bg-alert-red',
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration Plant',
    icon: 'thermometer',
    href: '/refrigeration',
    color: 'bg-teal-700',
  },
  {
    id: 'air-quality',
    name: 'Air Quality',
    icon: 'wind',
    href: '/air-quality',
    color: 'bg-green-700',
  },
  {
    id: 'admin',
    name: 'Admin Control Center',
    icon: 'settings',
    href: '/admin',
    color: 'bg-gray-700',
    adminOnly: true,
  },
]

// ─── Ice Operations Sub-Tabs ─────────────────────────────────────────────────

export const ICE_OPERATIONS_TABS = [
  { id: 'ice-cut', label: 'Ice Cut' },
  { id: 'edging', label: 'Edging' },
  { id: 'circle-check', label: 'Circle Check' },
  { id: 'blade-change', label: 'Blade Change' },
] as const

// ─── Role Hierarchy ──────────────────────────────────────────────────────────
// Higher index = higher privilege. Used for permission checking.

export const ROLE_HIERARCHY = [
  'read_only',
  'staff',
  'supervisor',
  'manager',
  'facility_admin',
  'super_admin',
] as const

// ─── Module Limits ───────────────────────────────────────────────────────────

export const MAX_DAILY_REPORT_TABS = 15
export const MAX_ICE_DEPTH_TEMPLATES = 8

// ─── Body Diagram Regions (Incident Reporting) ──────────────────────────────

export const BODY_REGIONS_FRONT = [
  { id: 'head_front', label: 'Head', x: 50, y: 5, w: 12, h: 8 },
  { id: 'face', label: 'Face', x: 50, y: 10, w: 10, h: 6 },
  { id: 'neck', label: 'Neck', x: 50, y: 16, w: 6, h: 4 },
  { id: 'left_shoulder', label: 'L Shoulder', x: 35, y: 20, w: 10, h: 6 },
  { id: 'right_shoulder', label: 'R Shoulder', x: 65, y: 20, w: 10, h: 6 },
  { id: 'chest', label: 'Chest', x: 50, y: 25, w: 20, h: 10 },
  { id: 'left_upper_arm', label: 'L Upper Arm', x: 27, y: 26, w: 6, h: 12 },
  { id: 'right_upper_arm', label: 'R Upper Arm', x: 73, y: 26, w: 6, h: 12 },
  { id: 'left_elbow', label: 'L Elbow', x: 25, y: 38, w: 6, h: 5 },
  { id: 'right_elbow', label: 'R Elbow', x: 75, y: 38, w: 6, h: 5 },
  { id: 'abdomen', label: 'Abdomen', x: 50, y: 37, w: 18, h: 10 },
  { id: 'left_forearm', label: 'L Forearm', x: 22, y: 43, w: 6, h: 10 },
  { id: 'right_forearm', label: 'R Forearm', x: 78, y: 43, w: 6, h: 10 },
  { id: 'left_wrist', label: 'L Wrist', x: 20, y: 53, w: 5, h: 4 },
  { id: 'right_wrist', label: 'R Wrist', x: 80, y: 53, w: 5, h: 4 },
  { id: 'left_hand', label: 'L Hand', x: 18, y: 57, w: 6, h: 6 },
  { id: 'right_hand', label: 'R Hand', x: 82, y: 57, w: 6, h: 6 },
  { id: 'hip_pelvis', label: 'Hip/Pelvis', x: 50, y: 48, w: 20, h: 6 },
  { id: 'left_upper_leg', label: 'L Thigh', x: 42, y: 55, w: 8, h: 14 },
  { id: 'right_upper_leg', label: 'R Thigh', x: 58, y: 55, w: 8, h: 14 },
  { id: 'left_knee', label: 'L Knee', x: 42, y: 69, w: 7, h: 5 },
  { id: 'right_knee', label: 'R Knee', x: 58, y: 69, w: 7, h: 5 },
  { id: 'left_lower_leg', label: 'L Shin', x: 42, y: 74, w: 7, h: 14 },
  { id: 'right_lower_leg', label: 'R Shin', x: 58, y: 74, w: 7, h: 14 },
  { id: 'left_ankle', label: 'L Ankle', x: 42, y: 88, w: 6, h: 4 },
  { id: 'right_ankle', label: 'R Ankle', x: 58, y: 88, w: 6, h: 4 },
  { id: 'left_foot', label: 'L Foot', x: 42, y: 92, w: 7, h: 6 },
  { id: 'right_foot', label: 'R Foot', x: 58, y: 92, w: 7, h: 6 },
] as const

export const BODY_REGIONS_BACK = [
  { id: 'head_back', label: 'Head (Back)', x: 50, y: 5, w: 12, h: 8 },
  { id: 'neck_back', label: 'Neck (Back)', x: 50, y: 16, w: 6, h: 4 },
  { id: 'left_shoulder_back', label: 'L Shoulder (Back)', x: 35, y: 20, w: 10, h: 6 },
  { id: 'right_shoulder_back', label: 'R Shoulder (Back)', x: 65, y: 20, w: 10, h: 6 },
  { id: 'upper_back', label: 'Upper Back', x: 50, y: 27, w: 22, h: 10 },
  { id: 'left_upper_arm_back', label: 'L Upper Arm (Back)', x: 27, y: 26, w: 6, h: 12 },
  { id: 'right_upper_arm_back', label: 'R Upper Arm (Back)', x: 73, y: 26, w: 6, h: 12 },
  { id: 'left_elbow_back', label: 'L Elbow (Back)', x: 25, y: 38, w: 6, h: 5 },
  { id: 'right_elbow_back', label: 'R Elbow (Back)', x: 75, y: 38, w: 6, h: 5 },
  { id: 'lower_back', label: 'Lower Back', x: 50, y: 40, w: 20, h: 10 },
  { id: 'left_forearm_back', label: 'L Forearm (Back)', x: 22, y: 43, w: 6, h: 10 },
  { id: 'right_forearm_back', label: 'R Forearm (Back)', x: 78, y: 43, w: 6, h: 10 },
  { id: 'left_hand_back', label: 'L Hand (Back)', x: 18, y: 57, w: 6, h: 6 },
  { id: 'right_hand_back', label: 'R Hand (Back)', x: 82, y: 57, w: 6, h: 6 },
  { id: 'buttocks', label: 'Buttocks', x: 50, y: 52, w: 20, h: 6 },
  { id: 'left_hamstring', label: 'L Hamstring', x: 42, y: 60, w: 8, h: 14 },
  { id: 'right_hamstring', label: 'R Hamstring', x: 58, y: 60, w: 8, h: 14 },
  { id: 'left_knee_back', label: 'L Knee (Back)', x: 42, y: 72, w: 7, h: 5 },
  { id: 'right_knee_back', label: 'R Knee (Back)', x: 58, y: 72, w: 7, h: 5 },
  { id: 'left_calf', label: 'L Calf', x: 42, y: 79, w: 7, h: 12 },
  { id: 'right_calf', label: 'R Calf', x: 58, y: 79, w: 7, h: 12 },
  { id: 'left_ankle_back', label: 'L Ankle (Back)', x: 42, y: 88, w: 6, h: 4 },
  { id: 'right_ankle_back', label: 'R Ankle (Back)', x: 58, y: 88, w: 6, h: 4 },
  { id: 'left_heel', label: 'L Heel', x: 42, y: 93, w: 7, h: 5 },
  { id: 'right_heel', label: 'R Heel', x: 58, y: 93, w: 7, h: 5 },
] as const

// ─── Ice Depth Color Thresholds ──────────────────────────────────────────────
// Portrait orientation preferred on mobile for Ice Depth module

export const ICE_DEPTH_COLORS = {
  green: { min: 1.0, max: 1.74, color: '#69BE28', label: 'Optimal' },
  yellow: { min: 1.75, max: 3.5, color: '#FFB800', label: 'Too Thick' },
  red: { min: 0, max: 0.99, color: '#D32F2F', label: 'Too Thin' },
} as const

// ─── Brand Colors ────────────────────────────────────────────────────────────

export const BRAND_COLORS = {
  navy: '#002244',
  actionGreen: '#69BE28',
  wolfGrey: '#A5ACAF',
  alertYellow: '#FFB800',
  alertRed: '#D32F2F',
  darkBg: '#001122',
} as const

// ─── Tennity Pilot Defaults ──────────────────────────────────────────────────

export const DEFAULT_CERTIFICATIONS = [
  'Zamboni Operator',
  'First Aid / CPR',
  'AED',
] as const
