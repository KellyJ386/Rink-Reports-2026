import { renderHook } from '@testing-library/react'
import { AuthContext, type AuthContextValue, type Profile } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/database'
import type { ReactNode } from 'react'

function makeProfile(role: UserRole): Profile {
  return {
    id: 'user-1',
    facility_id: 'facility-1',
    full_name: 'Test User',
    email: 'test@facility.com',
    role,
    position: null,
    certifications: null,
    is_active: true,
    last_active_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
}

function createWrapper(profile: Profile | null) {
  const value: AuthContextValue = {
    user: profile ? ({ id: profile.id } as AuthContextValue['user']) : null,
    profile,
    facility: null,
    loading: false,
    signOut: async () => {},
  }

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
  }
}

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an <AuthProvider>')
  })

  describe('hasRole', () => {
    const roles: UserRole[] = ['read_only', 'staff', 'supervisor', 'manager', 'facility_admin', 'super_admin']

    it('super_admin has all roles', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('super_admin')),
      })
      for (const role of roles) {
        expect(result.current.hasRole(role)).toBe(true)
      }
    })

    it('staff has staff and read_only roles', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('staff')),
      })
      expect(result.current.hasRole('read_only')).toBe(true)
      expect(result.current.hasRole('staff')).toBe(true)
      expect(result.current.hasRole('supervisor')).toBe(false)
      expect(result.current.hasRole('manager')).toBe(false)
      expect(result.current.hasRole('facility_admin')).toBe(false)
    })

    it('read_only only has read_only', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('read_only')),
      })
      expect(result.current.hasRole('read_only')).toBe(true)
      expect(result.current.hasRole('staff')).toBe(false)
    })

    it('returns false when no profile', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(null),
      })
      expect(result.current.hasRole('staff')).toBe(false)
    })
  })

  describe('canAccess', () => {
    it('staff can access operational modules', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('staff')),
      })
      expect(result.current.canAccess('daily-reports')).toBe(true)
      expect(result.current.canAccess('ice-depth')).toBe(true)
      expect(result.current.canAccess('ice-operations')).toBe(true)
      expect(result.current.canAccess('scheduling')).toBe(true)
      expect(result.current.canAccess('incidents')).toBe(true)
      expect(result.current.canAccess('refrigeration')).toBe(true)
      expect(result.current.canAccess('air-quality')).toBe(true)
    })

    it('staff cannot access admin', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('staff')),
      })
      expect(result.current.canAccess('admin')).toBe(false)
    })

    it('facility_admin can access admin', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('facility_admin')),
      })
      expect(result.current.canAccess('admin')).toBe(true)
    })

    it('read_only cannot access any module', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(makeProfile('read_only')),
      })
      expect(result.current.canAccess('daily-reports')).toBe(false)
      expect(result.current.canAccess('admin')).toBe(false)
    })

    it('returns false when no profile', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(null),
      })
      expect(result.current.canAccess('daily-reports')).toBe(false)
    })
  })
})
