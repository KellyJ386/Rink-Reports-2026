'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icons'
import { getSyncQueueCount } from '@/lib/offline/sync-queue'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Poll pending count every 3 seconds
    async function refreshCount() {
      try {
        const count = await getSyncQueueCount()
        setPendingSync(count)
      } catch {
        // IndexedDB may not be available
      }
    }
    refreshCount()
    const interval = setInterval(refreshCount, 3000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (isOnline && pendingSync === 0) return null

  return (
    <div className="bg-alert-yellow/10 text-alert-yellow-dark border-b border-alert-yellow/20 px-4 py-2 flex items-center justify-center gap-2 text-sm">
      {!isOnline ? (
        <>
          <Icon name="wifi-off" size={16} />
          <span>You are offline. Changes will sync when connected.</span>
          {pendingSync > 0 && (
            <span className="ml-2 bg-navy text-white text-xs px-2 py-0.5 rounded-full">
              {pendingSync} pending
            </span>
          )}
        </>
      ) : (
        <>
          <Icon name="refresh-cw" size={16} className="animate-spin" />
          <span>Syncing {pendingSync} pending change{pendingSync !== 1 ? 's' : ''}...</span>
        </>
      )}
    </div>
  )
}
