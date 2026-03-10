import { ModuleConfig } from '@/types'

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
  {
    id: 'communication',
    name: 'Communication',
    icon: 'message-square',
    href: '/communication',
    color: 'bg-indigo-700',
  },
]

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
  { id: 'neck', label: 'Neck', x: 50, y: 16, w: 6, h: 4 },
  { id: 'upper_back', label: 'Upper Back', x: 50, y: 23, w: 22, h: 12 },
  { id: 'lower_back', label: 'Lower Back', x: 50, y: 38, w: 20, h: 10 },
] as const

export const ICE_DEPTH_COLORS = {
  green: { min: 1.0, max: 1.74, color: '#69BE28', label: 'Optimal' },
  yellow: { min: 1.75, max: 3.5, color: '#FFB800', label: 'Too Thick' },
  red: { min: 0, max: 0.99, color: '#D32F2F', label: 'Too Thin' },
} as const
