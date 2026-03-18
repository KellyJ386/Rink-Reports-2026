'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Facility = Database['public']['Tables']['facilities']['Row']

export interface AuthContextValue {
  /** Supabase auth user (null when logged out) */
  user: User | null
  /** User profile from the `profiles` table */
  profile: Profile | null
  /** Facility the user belongs to */
  facility: Facility | null
  /** True while the initial session is being resolved */
  loading: boolean
  /** Sign the user out and clear local state */
  signOut: () => Promise<void>
}

// ── Context ────────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ── Provider ───────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  // Fetch profile and facility for a given user id
  const fetchProfileAndFacility = useCallback(
    async (userId: string) => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError || !profileData) {
        setProfile(null)
        setFacility(null)
        return
      }

      setProfile(profileData)

      if (profileData.facility_id) {
        const { data: facilityData } = await supabase
          .from('facilities')
          .select('*')
          .eq('id', profileData.facility_id)
          .single()

        setFacility(facilityData ?? null)
      } else {
        setFacility(null)
      }
    },
    [supabase]
  )

  // Bootstrap: resolve the current session on mount
  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await fetchProfileAndFacility(session.user.id)
      }
      setLoading(false)
    }

    initSession()
  }, [supabase, fetchProfileAndFacility])

  // Listen for auth state changes (login, logout, token refresh)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchProfileAndFacility(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setFacility(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfileAndFacility])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setFacility(null)
  }, [supabase])

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, facility, loading, signOut }),
    [user, profile, facility, loading, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
