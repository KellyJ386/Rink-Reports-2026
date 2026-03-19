'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { initPostHog, identifyUser } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (user && profile) {
      identifyUser(user.id, {
        email: user.email,
        role: profile.role,
        facility_id: profile.facility_id,
      })
    }
  }, [user, profile])

  return <>{children}</>
}
