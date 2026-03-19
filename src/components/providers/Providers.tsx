'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </AuthProvider>
  )
}
