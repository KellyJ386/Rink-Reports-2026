'use client'

import { useContext } from 'react'
import { AuthContext, type Facility } from '@/contexts/AuthContext'

export interface UseFacilityReturn {
  /** The current user's facility (null if not loaded or user has no facility) */
  facility: Facility | null
  /** Convenience accessor for facility id */
  facilityId: string | null
  /** Convenience accessor for facility name */
  facilityName: string | null
  /** Convenience accessor for facility timezone */
  facilityTimezone: string | null
  /** True while the auth session is still loading */
  loading: boolean
}

export function useFacility(): UseFacilityReturn {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useFacility must be used within an <AuthProvider>')
  }

  const { facility, loading } = context

  return {
    facility,
    facilityId: facility?.id ?? null,
    facilityName: facility?.name ?? null,
    facilityTimezone: facility?.timezone ?? null,
    loading,
  }
}
