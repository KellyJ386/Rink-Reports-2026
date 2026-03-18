'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui/Icons'
import { AlertBadge } from '@/components/ui/AlertBadge'
import { MODULES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { canAccess } = useAuth()

  const visibleModules = MODULES.filter((mod) => canAccess(mod.id))

  // Alert counts will be wired to live data in Phase 3
  const alertCounts: Record<string, number> = {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleModules.map((mod) => (
          <Link
            key={mod.id}
            href={mod.href}
            className={`dashboard-btn ${mod.color}`}
          >
            <AlertBadge count={alertCounts[mod.id] || 0} />
            <Icon name={mod.icon} size={32} className="mb-2" />
            <span className="text-center text-sm lg:text-base">{mod.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
