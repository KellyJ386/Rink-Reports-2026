'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icons'
import { AlertBadge } from '@/components/ui/AlertBadge'
import { getSyncQueueCount } from '@/lib/offline/sync-queue'

interface HeaderProps {
  onMenuToggle: () => void
  notificationCount?: number
}

export function Header({ onMenuToggle, notificationCount = 0 }: HeaderProps) {
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    async function refreshCount() {
      try {
        const count = await getSyncQueueCount()
        setPendingSync(count)
      } catch {
        // IndexedDB may not be available
      }
    }
    refreshCount()
    const interval = setInterval(refreshCount, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-navy-dark border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Icon name="menu" size={24} />
        </button>

        {/* Logo (centered on mobile) */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <h1 className="text-lg font-bold text-navy dark:text-white">
            Rink Reports
          </h1>
        </div>

        {/* Right side: Sync indicator + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Sync indicator */}
          {pendingSync > 0 && (
            <div className="flex items-center gap-1 text-xs text-alert-yellow-dark bg-alert-yellow/10 px-2 py-1 rounded-full">
              <Icon name="refresh-cw" size={14} className="animate-spin" />
              <span>{pendingSync}</span>
            </div>
          )}

          <button
            className="relative min-h-touch min-w-touch flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Icon name="bell" size={24} />
            <AlertBadge count={notificationCount} />
          </button>
          <button
            className="min-h-touch min-w-touch flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="User menu"
          >
            <Icon name="user" size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}
