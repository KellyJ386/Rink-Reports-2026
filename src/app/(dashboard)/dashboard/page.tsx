'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui/Icons'
import { AlertBadge } from '@/components/ui/AlertBadge'
import { MODULES } from '@/lib/constants'

// Mock alert counts - would come from API
const alertCounts: Record<string, number> = {
  refrigeration: 2,
  incidents: 1,
  'air-quality': 0,
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MODULES.map((mod) => (
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
