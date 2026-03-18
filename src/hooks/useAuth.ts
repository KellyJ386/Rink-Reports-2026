'use client'

import { useContext, useCallback } from 'react'
import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import type { ModuleId } from '@/types'

// ── Role hierarchy (higher index = more privilege) ─────────────────────────────

const ROLE_HIERARCHY: readonly UserRole[] = [
  'read_only',
  'staff',
  'supervisor',
  'manager',
  'facility_admin',
  'super_admin',
] as const

function roleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role)
}

// ── Module access by minimum role ──────────────────────────────────────────────

const MODULE_MIN_ROLE: Record<ModuleId, UserRole> = {
  'daily-reports': 'staff',
  'ice-depth': 'staff',
  'ice-operations': 'staff',
  scheduling: 'staff',
  incidents: 'staff',
  refrigeration: 'staff',
  'air-quality': 'staff',
  admin: 'facility_admin',
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface UseAuthReturn extends AuthContextValue {
  /** Returns true if the user's role is at least `minRole` in the hierarchy */
  hasRole: (minRole: UserRole) => boolean
  /** Returns true if the user can access the given module */
  canAccess: (module: ModuleId) => boolean
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }

  const { profile } = context

  const hasRole = useCallback(
    (minRole: UserRole): boolean => {
      if (!profile) return false
      return roleLevel(profile.role) >= roleLevel(minRole)
    },
    [profile]
  )

  const canAccess = useCallback(
    (module: ModuleId): boolean => {
      if (!profile) return false
      const minRole = MODULE_MIN_ROLE[module]
      return roleLevel(profile.role) >= roleLevel(minRole)
    },
    [profile]
  )

  return {
    ...context,
    hasRole,
    canAccess,
  }
}
